const {Command} = require('../../..')

const DOUBLE_DASH = '--'

class Log extends Command {
  constructor () {
    super()

    const options = {
      port: {
        type: 'number',
        default: 3000,
        description: 'port to bind on'
      },

      verbose: {
        type: 'boolean',
        default: false,
        description: 'verbose output'
      }
    }

    if (process.env.CUSTOM_VERSION) {
      options.version = {
        type: 'boolean'
      }
    }

    this.options = options

    this.version = '2.0.0'

    if (process.env.SUB_OFFSET) {
      this.offset = 3
    }

    if (process.env.INVALID_OPTION_GROUPS) {
      this.optionGroups = [{
        title: 'foo',
        options: [1]
      }]
    }
  }

  run ({
    argv: {
      port,
      verbose,
      [DOUBLE_DASH]: __,
      __: _
    }
  }) {
    if (process.env.DOUBLE_SLASH) {
      console.log(JSON.stringify({
        port,
        verbose,
        [DOUBLE_DASH]: __
      }))
      return
    }

    if (process.env.DOUBLE_UNDERSCORE) {
      console.log(JSON.stringify({
        __: _
      }))
      return
    }

    console.log(JSON.stringify({
      port,
      verbose
    }))
  }
}

if (process.env.HAS_DESCRIPTION) {
  Object.defineProperty(Log.prototype, 'description', {
    get () {
      return 'description'
    }
  })
}

module.exports = Log
