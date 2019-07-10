const test = require('ava')
// const log = require('util').debuglog('bin-tool')
const {run} = require('./run')

const CASES = [
  [
    'default value',
    ['normal', ['log']],
    {
      port: 3000,
      verbose: false
    }
  ],
  [
    'offset = 3, default value',
    ['normal', ['xx', 'log'], {
      OFFSET: '3'
    }],
    {
      port: 3000,
      verbose: false
    }
  ],
  [
    'with options',
    [
      'normal',
      ['log', '--port', '7001', '--no-verbose']
    ],
    {
      port: 7001,
      verbose: false
    }
  ],
  [
    'alias command',
    ['normal', ['lg']],
    {
      port: 3000,
      verbose: false
    }
  ],
  [
    'no sub command',
    ['normal', []],
    `bin [command]

Commands:
  log, lg`
  ],
  [
    'version',
    ['normal', ['--version']],
    '1.0.0'
  ]
]

CASES.forEach(([d, args, ex]) => {
  test(`${args[0]}: ${d}`, async t => {
    const content = await run(...args)
    t.is(
      content,
      Object(ex) === ex
        ? JSON.stringify(ex)
        : ex
    )
  })
})
