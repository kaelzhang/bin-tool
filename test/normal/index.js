module.exports = Command => class extends Command {
  constructor (argv) {
    super(argv)

    this.load(require('path').join(__dirname, 'command'))
  }
}
