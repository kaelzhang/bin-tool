module.exports = Command => class extends Command {
  constructor (argv) {
    super(argv)

    this.load(require('path').join(__dirname, 'command'))
    this.alias('lg', 'log')

    this.version = '1.0.0'

    if (process.env.OFFSET) {
      this.offset = Number(process.env.OFFSET)
    }
  }
}
