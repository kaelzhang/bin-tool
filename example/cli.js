const path = require('path')
const {Command} = require('bin-tool')

module.exports = class MainCommand extends Command {
  constructor () {
    super()

    // Load sub commands
    this.load(path.join(__dirname, 'command'))

    // serve.js exists in './command/'
    // add `sv` as the alias of commend list

    // example serve
    // example sv
    this.alias('sv', 'serve')

    // Set the argv offset to 2 which is the default value,
    // so the followling line could be omitted
    this.offset = 2
  }
}
