module.exports = Command => {
  class HelpCommand extends Command {
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

      if (process.env.OPTION_GROUPS) {
        options.foo = {
          type: 'boolean'
        }

        this.optionGroups = [{
          title: 'Foo:',
          options: ['foo']
        }]
      }

      this.options = options
    }
  }

  if (!process.env.OPTION_GROUPS) {
    HelpCommand.prototype.showHelp = () => {
      console.log('help')
    }
  }

  return HelpCommand
}
