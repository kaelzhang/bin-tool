const {Command} = require('../../..')

module.exports = class extends Command {
  constructor () {
    super()

    this.options = {
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

    if (process.env.SUB_OFFSET) {
      this.offset = 3
    }
  }

  run ({
    argv: {
      port,
      verbose
    }
  }) {
    console.log(JSON.stringify({
      port,
      verbose
    }))
  }
}
