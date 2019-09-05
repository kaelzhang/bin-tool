const path = require('path')
const {defaults, BASIC_TYPES} = require('skema')
const minimist = require('minimist')
const {
  isObject, isArray, isString, isFunction
} = require('core-util-is')
const UI = require('cliui')

const error = require('./error')

const {
  shape,
  any,
  set
} = defaults({
  async: true,
  types: BASIC_TYPES.LOOSE
})

const DOUBLE_DASH = '--'

// ```js
// {
//   foo: {
//     enumerable: false,
//     type: 'string',
//     alias: ['f'],
//     alias: 'f'
//     description: 'specify the current used workspace',
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
  string.replace(/\$command/g, command)

const printOptionsKey = key => key.length === 1
  ? `-${key}`
  : `--${key}`

const printOptionKeys = (key, aliases) =>
  [key].concat(aliases).map(printOptionsKey).join(', ')

const renderOptionGroup = (ui, {
  title,
  options
}) => {
  ui.div({
    text: title,
    padding: [1, 0, 0, 0]
  })

  for (const {
    key,
    option: {
      enumerable,
      aliases,
      description = ''
    }
  } of options) {
    if (!enumerable) {
      continue
    }

    const cells = [{
      text: printOptionKeys(key, aliases),
      width: 20,
      padding: [0, 2, 0, 2]
    }, {
      text: description,
      width: 50
    }]

    // TODO: type and required

    ui.div(...cells)
  }
}

const isBooleanType = type => type === 'boolean' || type === Boolean
const isStringType = type => type === 'string' || type === String

class Argv {
  constructor () {
    this._aliases = Object.create(null)
    this._booleanKeys = new Set()
    this._stringKeys = new Set()
    this._options = null
    this._userOptions = false
    this._shape = null
    this._usage = undefined
    this._groups = []
    this._commands = Object.create(null)
    this._offset = 2
    this._rawArgv = []
  }

  argv (argv) {
    this._rawArgv = argv
    return this
  }

  offset (offset) {
    this._offset = offset
    return this
  }

  command (name, {description, alias}) {
    this._commands[name] = {
      description: description || '',
      alias
    }

    return this
  }

  // ['/usr/local/bin/node', '/path/to/npm', 'create', '--options']
  //                                          ^
  // -> 'npm'

  // ['/usr/local/bin/node', '/path/to/npm', 'create', '--options']
  //                                                    ^
  // -> 'npm create'
  get commandName () {
    return this._rawArgv
    .slice(1, this._offset)
    .map(s => path.basename(s, '.js'))
    .join(' ')
  }

  usage (usage) {
    if (isString(usage) || isFunction(usage)) {
      this._usage = usage
      return this
    }

    throw error('INVALID_USAGE', usage)
  }

  groups (groups) {
    this._groups = groups
    return this
  }

  description (description) {
    if (isString(description)) {
      this._description = description
      return this
    }

    throw error('INVALID_DESC', description)
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
        type,
        ...skema
      } = option

      let typeGroup

      if (isBooleanType(type)) {
        this._booleanKeys.add(name)
        typeGroup = this._booleanKeys
      } else if (isStringType(type)) {
        this._stringKeys.add(name)
        typeGroup = this._stringKeys
      }

      const aliases = parseAlias(alias, name)

      this._addAlias(name, aliases, typeGroup)

      const required = skema.required === true
      const isEnumerable = enumerable !== false

      options[name] = {
        // Defaults to true
        enumerable: isEnumerable,
        description,
        aliases
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

  _addAlias (name, aliases, typeGroup) {
    for (const alias of aliases) {
      this.alias(name, alias)

      if (typeGroup) {
        typeGroup.add(alias)
      }
    }
  }

  defined (name) {
    return this._options
      ? name in this._options
      : false
  }

  includedInRaw (...args) {
    return args.some(arg => this._rawArgv.includes(arg))
  }

  _applyAliases (parsed) {
    for (const [alias, key] of Object.entries(this._aliases)) {
      if ((alias in parsed) && !(key in parsed)) {
        parsed[key] = parsed[alias]
        delete parsed[alias]
      }
    }
  }

  simpleParse () {
    if (this._rawParsed) {
      return this._rawParsed
    }

    return this._rawParsed = minimist(this._rawArgv.slice(this._offset), {
      [DOUBLE_DASH]: true,
      boolean: [...this._booleanKeys],
      string: [...this._stringKeys]
    })
  }

  async parse () {
    const parsed = this.simpleParse()

    this._applyAliases(parsed)

    if (!this._shape) {
      return parsed
    }

    return this._shape.from(parsed)
  }

  _getDefaultUsage (command) {
    let usage = command

    if (Object.keys(this._commands).length) {
      usage += ' [command]'
    }

    if (this._userOptions) {
      usage += ' [options]'
    }

    return usage
  }

  _getUsage () {
    let rawUsage = this._usage
    const {commandName} = this

    if (!rawUsage) {
      return this._getDefaultUsage(commandName)
    }

    if (isString(rawUsage)) {
      return interpolatedCommand(rawUsage, commandName)
    }

    rawUsage = rawUsage()
    if (!isString(rawUsage)) {
      throw error('INVALID_USAGE_RETURN_TYPE', rawUsage)
    }

    return interpolatedCommand(rawUsage, commandName)
  }

  // TODO: layout options

  // brog [command]

  // Commands:
  //   brog completion  generate bash completion script
  //   brog add

  // Global Options:
  //   -h, --help         Show help    [boolean]
  //   -V, --version, -v  Show version number

  // Returns `string`
  help () {
    const ui = UI()

    ui.div(this._getUsage())

    if (this._description) {
      ui.div({
        text: this._description,
        padding: [1, 0, 0, 0]
      })
    }

    if (Object.keys(this._commands).length) {
      ui.div({
        text: 'Commands:',
        padding: [1, 0, 0, 0]
      })

      for (const [command, {
        description,
        alias
      }] of Object.entries(this._commands)) {
        ui.div({
          text: [command].concat(alias).join(', '),
          width: 30,
          padding: [0, 2, 0, 2]
        }, {
          text: description,
          padding: [0, 2, 0, 0]
        })
      }
    }

    if (this._userOptions) {
      for (const group of this._getGroups()) {
        renderOptionGroup(ui, group)
      }
    }

    return ui.toString()
  }

  _getGroups () {
    const optionsMap = {
      ...this._options
    }

    const groups = this._groups.map(({title, options}) => {
      options = options
      .map(key => {
        const option = optionsMap[key]
        delete optionsMap[key]

        if (option) {
          return {
            key, option
          }
        }

        return false
      })
      .filter(Boolean)

      return {title, options}
    })

    const defaultOptions = []

    for (const [key, option] of Object.entries(optionsMap)) {
      defaultOptions.push({key, option})
    }

    groups.unshift({
      title: 'Options:',
      options: defaultOptions
    })

    return groups.filter(({options}) => options.length !== 0)
  }
}

module.exports = {
  Argv,
  set
}
