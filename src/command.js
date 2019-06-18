const log = require('util').debuglog('bin-tool')
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const error = require('./error')
const Argv = require('./argv')
// const helper = require('./helper')

const symbol = name => Symbol(`bin-tool:${name}`)

const COMMANDS = symbol('commands')
const ARGV = symbol('argv')
const VERSION = symbol('version')
const DISPATCH = symbol('dispatch')

module.exports = class Command {
  constructor (rawArgv) {
    /**
     * original argument
     * @type {Array}
     */
    this.rawArgv = rawArgv || process.argv.slice(2)
    // debug('[%s] origin argument `%s`', this.constructor.name, this.rawArgv.join(' '))

    this[ARGV] = new Argv()

    // <commandName, Command>
    this[COMMANDS] = new Map()
  }

  /**
   * command handler, could be async function / normal function
   * @param {Object} context - context object
   * @param {String} context.cwd - process.cwd()
   * @param {Object} context.argv - parsed argv object
   * @param {Array} context.rawArgv - the raw argv, `[ "--baseDir=simple" ]`
   * @protected
   */
  run () {
    this.showHelp()
  }

  /**
   * load sub commands
   * @param {String} fullPath - the command directory
   * @example `load(path.join(__dirname, 'command'))`
   */
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

    // debug('[%s] loaded command `%s` from directory `%s`',
    //   this.constructor.name, names, fullPath)
  }

  /**
   * add sub command
   * @param {String} name - a command name
   * @param {String|Class} target - special file path (must contains ext) or Command Class
   * @example `add('test', path.join(__dirname, 'test_command.js'))`
   */
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

    this[COMMANDS].set(name, target)
  }

  /**
   * alias an existing command
   * @param {String} alias - alias command
   * @param {String} name - exist command
   */
  alias (alias, name) {
    assert(alias, 'alias command name is required')
    assert(this[COMMANDS].has(name), `${name} should be added first`)
    // debug('[%s] set `%s` as alias of `%s`', this.constructor.name, alias, name)
    this[COMMANDS].set(alias, this[COMMANDS].get(name))
  }

  /**
   * start point of bin process
   */
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

  /**
   * default error hander
   * @param {Error} err - error object
   * @protected
   */
  errorHandler (err) {
    log(err.stack)
    process.exit(1)
  }

  /**
   * print help message to console
   * @param {String} [level=log] - console level
   */
  showHelp () {
    console.log(this[ARGV].help())
  }

  /**
   * shortcut for yargs.options
   * @param  {Object} opt - an object set to `yargs.options`
   */
  set options (options) {
    this[ARGV].options(options)
  }

  /**
   * shortcut for yargs.usage
   * @param  {String} usage - usage info
   */
  set usage (usage) {
    this[ARGV].usage(usage)
  }

  set version (ver) {
    this[VERSION] = ver
  }

  get version () {
    return this[VERSION]
  }

  async [DISPATCH] () {
    // get parsed argument without handling helper and version
    const argv = await this[ARGV].parse(this.rawArgv)

    if (argv.version && this.version) {
      console.log(this.version)
      return
    }

    const commandName = argv._[0]

    // if sub command exist
    if (this[COMMANDS].has(commandName)) {
      const SubCommand = this[COMMANDS].get(commandName)
      const rawArgv = this.rawArgv.slice()
      rawArgv.splice(rawArgv.indexOf(commandName), 1)

      const command = new SubCommand(rawArgv)
      await command[DISPATCH]()
      return
    }

    // register command for printing
    for (const [name, SubCommand] of this[COMMANDS].entries()) {
      this[ARGV].command(name, SubCommand.prototype.description)
    }

    const {context} = this
    context.argv = argv

    await this.run(context)
  }
}
