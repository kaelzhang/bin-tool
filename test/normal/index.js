module.exports = Command => class extends Command {
  constructor (argv) {
    super(argv)

    if (process.env.INVALID_LOAD) {
      this.load('not-exists')
    } else {
      this.load(require('path').join(__dirname, 'command'))
    }

    this.alias('lg', 'log')

    if (process.env.DUPLICATE_ALIAS) {
      this.alias('lg', 'log')
    }

    this.version = '1.0.0'

    if (process.env.OFFSET) {
      this.offset = Number(process.env.OFFSET)
    }

    if (process.env.INVALID_OFFSET) {
      this.offset = 'a'
    }
  }
}
