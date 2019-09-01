const log = require('util').debuglog('bin-tool')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const {isNumber} = require('core-util-is')

const error = require('./error')
const Argv = require('./argv')

const symbol = name => Symbol(`bin-tool:${name}`)

const COMMANDS = symbol('commands')
const ARGV = symbol('argv')
const PROCESS_ARGV = symbol('process-argv')
const ARGV_VALUE = symbol('argv-value')
const VERSION = symbol('version')
const DISPATCH = symbol('dispatch')
const OFFSET = symbol('offset')
const SUB_COMMAND = symbol('sub-command')
const OPTIONS = symbol('options')
const USAGE = symbol('usage')

const getDescription = self => {
  const proto = Object.getPrototypeOf(self)

  return 'description' in proto
    ? self.description
    : undefined
}

module.exports = class Command {
  constructor (argv = process.argv) {
    // <commandName, Command>
    this[COMMANDS] = new Map()
    this[OFFSET] = 2
    this[PROCESS_ARGV] = argv
  }

  get [ARGV] () {
    if (this[ARGV_VALUE]) {
      return this[ARGV_VALUE]
    }

    const arg = this[ARGV_VALUE] = new Argv()
    .argv(this[PROCESS_ARGV])
    .offset(this[OFFSET])

    if (this[OPTIONS]) {
      arg.options(this[OPTIONS])
    }

    if (this[USAGE]) {
      arg.usage(this[USAGE])
    }

    const desc = getDescription(this)
    if (desc) {
      arg.description(desc)
    }

    return arg
  }

  set offset (offset) {
    if (!isNumber(offset)) {
      throw error('INVALID_OFFSET', offset)
    }

    if (this.constructor[SUB_COMMAND]) {
      throw error('SUB_OFFSET_NOT_ALLOWED')
    }

    this[OFFSET] = offset
  }

  // shortcut for yargs.options
  // @param  {Object} opt - an object set to `yargs.options`
  set options (options) {
    this[OPTIONS] = options
  }

  // shortcut for yargs.usage
  // @param  {String} usage - usage info
  set usage (usage) {
    this[USAGE] = usage
  }

  // command handler, could be async function / normal function
  // @param {Object} context - context object
  // @param {String} context.cwd - process.cwd()
  // @param {Object} context.argv - parsed argv object
  // @param {Array} context.rawArgv - the raw argv, `[ "--baseDir=simple" ]`
  // @protected
  run () {
    this.showHelp()
  }

  // load sub commands
  // @param {String} fullPath - the command directory
  // @example `load(path.join(__dirname, 'command'))`
  load (fullPath) {
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      throw error('INVALID_LOAD_PATH', fullPath)
    }

    // load entire directory
    const files = fs.readdirSync(fullPath)
    const names = []
    for (const file of files) {
      if (path.extname(file) === '.js') {
        const name = path.basename(file).replace(/\.js$/, '')
        names.push(name)
        this.add(name, path.join(fullPath, file))
      }
    }

    return this
  }

  // add sub command
  // @param {String} name - a command name
  // @param {String|Class} target - special file path (must contains ext) or Command Class
  // @example `add('test', path.join(__dirname, 'test_command.js'))`
  add (name, target) {
    assert(name, `${name} is required`)
    if (!(target.prototype instanceof Command)) {
      assert(
        fs.existsSync(target) && fs.statSync(target).isFile(),
        `${target} is not a file.`)

      // debug('[%s] add command `%s` from `%s`', this.constructor.name, name, target)

      target = require(target)
      assert(target.prototype instanceof Command,
        'command class should be sub class of Command')
    }

    this[COMMANDS].set(name, {
      Command: target,
      // The main name of the command
      name,
      // The alias names of the command
      alias: new Set()
    })

    return this
  }

  // Alias an existing command
  // @param {String} alias - alias command
  // @param {String} name - exist command
  alias (alias, name) {
    const commands = this[COMMANDS]

    assert(alias, 'alias command name is required')
    assert(commands.has(name), `${name} should be added first`)

    if (commands.has(alias)) {
      throw error('COMMAND_ALIAS_CONFLICT', alias, commands.get(alias).name)
    }

    const major = commands.get(name)
    major.alias.add(alias)

    commands.set(alias, major)

    return this
  }

  // start point of bin process
  async start () {
    // co(function* () {
    //   // replace `--get-yargs-completions` to our KEY, so yargs will not block our DISPATCH
    //   const index = this.rawArgv.indexOf('--get-yargs-completions')
    //   if (index !== - 1) {
    //     // bash will request as `--get-yargs-completions my-git remote add`, so need to remove 2
    //     this.rawArgv.splice(index, 2, `--AUTO_COMPLETIONS=${this.rawArgv.join(',')}`)
    //   }
    //   yield this[DISPATCH]()
    // }.bind(this)).catch(this.errorHandler.bind(this))
    try {
      await this[DISPATCH]()
    } catch (err) {
      this.errorHandler(err)
    }
  }

  // default error hander
  // @param {Error} err - error object
  // @protected
  errorHandler (err) {
    console.error(err.message)
    log(err.stack)
    process.exit(1)
  }

  // print help message to console
  showHelp () {
    console.log(this[ARGV].help())
  }

  set version (ver) {
    this[VERSION] = ver
  }

  get version () {
    return this[VERSION]
  }

  async [DISPATCH] () {
    // get parsed argument without handling helper and version
    const argvManager = this[ARGV]
    const simple = argvManager.simpleParse()

    const commandName = simple._[0]

    log('sub command: %s', commandName)

    // Test sub command name first
    // if sub command exist
    if (this[COMMANDS].has(commandName)) {
      const {
        Command: SubCommand
      } = this[COMMANDS].get(commandName)

      // Mark as sub command
      SubCommand[SUB_COMMAND] = true
      const command = new SubCommand()
      // Set the offset
      command[OFFSET] = this[OFFSET] + 1
      command[PROCESS_ARGV] = this[PROCESS_ARGV]

      delete SubCommand[SUB_COMMAND]

      await command[DISPATCH]()
      return
    }

    // User can override the behavior by define a version option
    if (
      // If use has defined the version option,
      // which indicates that user will handle argv.version,
      // then we should skip the default behavior
      !argvManager.defined('version')
      && argvManager.includedInRaw('-v', '--version')
    ) {
      console.log(this.version)
      return
    }

    // User can override the behavior by define a help option
    if (
      !argvManager.defined('help')
      && argvManager.includedInRaw('-h', '--help')
    ) {
      this.showHelp()
      return
    }

    // register command for printing
    for (const [name, {
      Command: SubCommand,
      name: majorName,
      alias
    }] of this[COMMANDS].entries()) {
      if (name === majorName) {
        const {description} = SubCommand.prototype

        this[ARGV].command(name, {
          description,
          alias: [...alias]
        })
      }
    }

    const argv = await argvManager.parse()

    log('argv: %j', argv)

    const context = {
      cwd: process.cwd(),
      rawArgv: this.rawArgv,
      argv
    }

    log('context: %j', context)

    await this.run(context)
  }
}
