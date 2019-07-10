const path = require('path')
const {fork} = require('child_process')

const commander = path.join(__dirname, 'commander.js')

const removesDebug = output => output
.trim()
.split(/\r|\n/g)
.filter(line => !line.startsWith('BIN-TOOL'))
.join('\n')

const run = (type, argv, env = {}) => {
  const options = JSON.stringify({
    type,
    argv: ['node', 'bin', ...argv]
  })

  return new Promise((resolve, reject) => {
    let data = ''
    let err = ''

    const child = fork(commander, [options], {
      stdio: 'pipe',
      env: {
        ...process.env,
        ...env
      }
    })

    child.on('close', code => {
      if (code === 0) {
        return resolve(removesDebug(data))
      }

      reject(new Error(err))
    })

    child.stdout.on('data', chunk => {
      data += chunk
    })

    child.stderr.on('data', chunk => {
      err += chunk
    })
  })
}

module.exports = {
  run
}
