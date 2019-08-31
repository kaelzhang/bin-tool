const test = require('ava')
const {Argv} = require('../src')

test('normal', async t => {
  const argv = await new Argv()
  .argv(['node', 'a', '--foo'])
  .parse()

  t.is(argv.foo, true)
})

// test('normal', async t => {

// })
