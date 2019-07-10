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

test('normal: alias command', async t => {
  const content = await run('normal', ['lg'])

  t.is(content, JSON.stringify({
    port: 3000,
    verbose: false
  }))
})

test('normal: no sub command', async t => {
  const content = await run('normal', [])

  t.is(content, `bin [command]

Commands:
  log, lg`)
})
