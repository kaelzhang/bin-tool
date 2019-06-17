const {defaults} = require('skema')
const minimist = require('minimist')
const assert = require('assert')

const {
  shape
} = defaults({
  async: true
})

// ```js
// {
//   foo: {
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

class Options {
  constructor (options) {
    assert()

    this._options = options
    this._alias = Object.create(null)

    for (const [name, option] of Object.entries(options)) {
      if (option) {

      }
    }
  }

  async parse (rawArgv) {
    const argv = minimist(rawArgv)
  }

  // npmw [command]

  // Commands:
  //   npmw completion  generate bash completion script
  //   npmw add

  // Global Options:
  //   -h, --help         Show help                                                                                 [boolean]
  //   -V, --version, -v  Show version number
  showHelp () {

  }
}
