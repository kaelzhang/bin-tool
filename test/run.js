const path = require('path')
const {fork} = require('child_process')

const commander = path.join(__dirname, 'commander.js')

const removesDebug = output => output
.split(/\r|\n/g)
.filter(line => {
  if (!line) {
    return false
  }

  return !line.startsWith('BIN-TOOL')
})
.join('\n')
.trim()

const run = (type, argv) => {
  const options = JSON.stringify({
    type,
    argv: ['node', 'bin', ...argv]
  })

  return new Promise((resolve, reject) => {
    let data = ''

    const child = fork(commander, [options], {
      stdio: 'pipe'
    })

    child.on('close', code => {
      if (code === 0) {
        return resolve(removesDebug(data))
      }

      reject()
    })

    child.stdout.on('data', chunk => {
      data += chunk
    })
  })
}

module.exports = {
  run
}
