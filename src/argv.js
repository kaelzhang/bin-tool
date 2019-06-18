const {defaults, BASIC_TYPES} = require('skema')
const minimist = require('minimist')
const {
  isObject, isArray, isString, isFunction, isNumber
} = require('core-util-is')
const UI = require('cliui')

const error = require('./error')

const {
  shape,
  any
} = defaults({
  async: true,
  types: BASIC_TYPES.LOOSE
})

// ```js
// {
//   foo: {
//     enumerable: false,
//     type: 'string',
//     alias: ['f'],
//     alias: 'f'
//     description: 'specify the current used workstation',
//     async default () {

//     },
//     async set: v => path.resolve(v)
//   }
// }
// ``

const parseAlias = (alias, name) => {
  if (!alias) {
    return []
  }

  if (isString(alias)) {
    return [alias]
  }

  if (isArray(alias) && alias.every(isString)) {
    return alias
  }

  throw error('INVALID_ALIAS', name, alias)
}

const interpolatedCommand = (string, command) =>
  string.replace(/\$0/g, command)

const printOptionsKey = key => key === 1
  ? `-${key}`
  : `--${key}`

const printOptionKeys = (key, aliases) =>
  [key].concat(aliases).map(printOptionsKey).join(', ')

module.exports = class Argv {
  constructor () {
    this._aliases = Object.create(null)
    this._options = null
    this._userOptions = false
    this._shape = null
    this._usage = undefined
    this._commands = Object.create(null)
    this._offset = 0
    // this._version = undefined
  }

  // version (version) {
  //   this._version = version
  //   return this
  // }

  offset (offset) {
    if (isNumber(offset)) {
      throw error('INVALID_OFFSET', offset)
    }

    this._offset = offset
    return this
  }

  command (name, description) {
    this._commands[name] = description || ''
    return this
  }

  usage (usage) {
    if (isString(usage) || isFunction(usage)) {
      this._usage = usage
      return this
    }

    throw error('INVALID_USAGE', usage)
  }

  options (rawOptions) {
    if (!isObject(rawOptions)) {
      throw error('INVALID_OPTIONS', rawOptions)
    }

    const argvShape = Object.create(null)
    const options = Object.create(null)

    for (const [name, option] of Object.entries(rawOptions)) {
      if (!isObject(option)) {
        throw error('INVALID_OPTION', name, option)
      }

      const {
        alias,
        enumerable,
        description,
        ...skema
      } = option

      const aliases = parseAlias(alias, name)

      this._addAlias(name, aliases)

      const required = skema.required === true

      options[name] = {
        enumerable: enumerable !== false,
        description,
        aliases,
        required
      }

      argvShape[name] = skema

      if (!skema.type) {
        skema.type = any()
      }

      if (!required) {
        skema.optional = true
      }
    }

    this._options = options
    this._shape = shape(argvShape)
    this._userOptions = true

    return this
  }

  alias (key, alias) {
    if (alias in this._aliases) {
      throw error('ALIAS_CONFLICT', alias, this._aliases[alias])
    }

    this._aliases[alias] = key

    return this
  }

  _addAlias (name, aliases) {
    for (const alias of aliases) {
      this.alias(name, alias)
    }
  }

  defined (name) {
    return name in this._options
  }

  async parse (argv = process.argv) {
    const parsed = minimist(argv.slice(this._offset))

    if (!this._shape) {
      return parsed
    }

    return this._shape.from(parsed)
  }

  _getDefaultUsage (command) {
    let usage = `Usage: ${command}`

    if (Object.keys(this._commands).length) {
      usage += ' [command]'
    }

    if (this._userOptions) {
      usage += ' [options]'
    }

    return usage
  }

  _getUsage (command) {
    let rawUsage = this._usage

    if (!rawUsage) {
      return this._getDefaultUsage(command)
    }

    if (isString(rawUsage)) {
      return interpolatedCommand(rawUsage, command)
    }

    rawUsage = rawUsage()
    if (!isString(rawUsage)) {
      throw error('INVALID_USAGE_RETURN_TYPE', rawUsage)
    }

    return interpolatedCommand(rawUsage, command)
  }

  // npmw [command]

  // Commands:
  //   npmw completion  generate bash completion script
  //   npmw add

  // Global Options:
  //   -h, --help         Show help    [boolean]
  //   -V, --version, -v  Show version number

  // Returns `string`
  help () {
    const command = process.argv.splice(this._offset)[0]
    const ui = UI()

    ui.div(this._getUsage(command))

    if (this._userOptions) {
      ui.div({
        test: 'Options:',
        padding: [2, 0, 2, 0]
      })

      for (const [key, {
        enumerable,
        aliases,
        description = ''
      }] of Object.entries(this._options)) {
        if (!enumerable) {
          continue
        }

        const cells = [{
          text: printOptionKeys(key, aliases),
          width: 20,
          padding: [0, 4, 0, 2]
        }, {
          text: description,
          width: 20
        }]

        // TODO: type and required

        ui.div(...cells)
      }
    }
  }
}
