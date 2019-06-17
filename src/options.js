const {defaults} = require('skema')
const minimist = require('minimist')
const {isObject, isArray, isString} = require('core-util-is')

const error = require('./error')

const {
  shape,
  any
} = defaults({
  async: true
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
//     // coerce: v => path.resolve(v)
//   }
// }
// ``

const parseAlias = (alias, name) => {
  if (!alias) {
    return
  }

  if (isString(alias)) {
    return [alias]
  }

  if (isArray(alias) && alias.every(isString)) {
    return alias
  }

  throw error('INVALID_ALIAS', name, alias)
}

module.exports = class Options {
  constructor (rawOptions) {
    if (!isObject(rawOptions)) {
      throw error('INVALID_OPTIONS', rawOptions)
    }

    this._aliases = Object.create(null)
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

      options[name] = {
        enumerable: enumerable !== false,
        description,
        aliases
      }

      argvShape[name] = skema

      if (!skema.type) {
        skema.type = any()
      }
    }

    this._options = options
    this._shape = shape(argvShape)
  }

  _addAlias (name, aliases) {
    for (const alias of aliases) {
      if (alias in this._aliases) {
        throw error('ALIAS_CONFLICT', alias, name, this._aliases[alias])
      }

      this._aliases[alias] = name
    }
  }

  async parse (rawArgv) {
    const argv = minimist(rawArgv)
    return this._shape.from(argv)
  }

  // npmw [command]

  // Commands:
  //   npmw completion  generate bash completion script
  //   npmw add

  // Global Options:
  //   -h, --help         Show help    [boolean]
  //   -V, --version, -v  Show version number
  showHelp () {

  }
}
