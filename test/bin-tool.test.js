const test = require('ava')
// const log = require('util').debuglog('bin-tool')
const {run} = require('./run')

test('normal: default value', async t => {
  const content = await run('normal', ['log'])

  t.is(content, JSON.stringify({
    port: 3000,
    verbose: false
  }))
})
