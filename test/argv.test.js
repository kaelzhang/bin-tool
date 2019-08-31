const test = require('ava')
const {Argv} = require('../src')

test('normal', async t => {
  const argv = await new Argv()
  .argv(['node', 'a', '--foo'])
  .parse()

  t.is(argv.foo, true)
})

test('boolean type, and string type', async t => {
  const argv = await new Argv()
  .argv(['node', 'a', '--foo', 'bar', '--baz', '--quux'])
  .options({
    foo: {
      type: 'boolean'
    },
    baz: {
      type: 'string'
    }
  })
  .parse()

  t.is(argv.foo, true)
  t.deepEqual(argv._, ['bar'])
  t.is(argv.baz, '')
  t.is(argv.quux, true)
})
