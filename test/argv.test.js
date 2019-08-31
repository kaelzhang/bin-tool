const test = require('ava')
const {Argv} = require('../src')

test('normal', async t => {
  const argv = await new Argv()
  .argv(['node', 'a', '--foo'])
  .parse()

  t.is(argv.foo, true)
})

test('boolean type', async t => {
  const argv = await new Argv()
  .argv(['node', 'a', '--foo', 'bar'])
  .options({
    foo: {
      type: 'boolean'
    }
  })
  .parse()

  t.is(argv.foo, true)
  t.deepEqual(argv._, ['bar'])
})
