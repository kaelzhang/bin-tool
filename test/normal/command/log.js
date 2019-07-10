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
