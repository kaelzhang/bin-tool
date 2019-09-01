module.exports = Command => class extends Command {
  constructor (argv) {
    super(argv)

    const options = {
      prop: {
        set () {
          throw new Error('fail')
        }
      }
    }

    if (process.env.HELP_DEFINED) {
      options.help = {
        type: 'boolean'
      }
    }

    this.options = options
  }

  showHelp () {
    console.log('help')
  }
}
