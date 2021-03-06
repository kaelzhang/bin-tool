const path = require('path')
const {Command} = require('bin-tool')

// ```sh
// example serve --port 3001 --verbose
// ```

module.exports = class extends Command {
  get description () {
    return 'start the server'
  }

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

  async run ({
    argv
  }) {
    if (argv.verbose) {
      console.info(`start server on :${argv.port}`)
    }

    serve(argv.port)
  }
}
