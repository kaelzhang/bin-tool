const test = require('ava')
// const log = require('util').debuglog('bin-tool')
const {run} = require('./run')

const CASES = [
  [
    // description
    'default value',
    // type, args
    ['normal', ['log']],
    // expected
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
    // description
    '--version',
    // type, args
    ['normal', ['--version']],
    // expected
    '1.0.0'
  ],
  [
    // description
    'sub --version',
    // type, args
    ['normal', ['log', '--version']],
    // expected
    '2.0.0'
  ],
  [
    // description
    'sub --version with custom option',
    // type, args
    ['normal', ['log', '--version'], {
      CUSTOM_VERSION: 'true'
    }],
    {
      port: 3000,
      verbose: false
    }
  ],
  [
    '--',
    ['normal', ['log', '--', '--no-limit'], {
      DOUBLE_SLASH: 'true'
    }],
    {
      port: 3000,
      verbose: false,
      __: ['--no-limit']
    }
  ],
  [
    'with no --',
    ['normal', ['log'], {
      DOUBLE_SLASH: 'true'
    }],
    {
      port: 3000,
      verbose: false,
      __: []
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
  ],
  [
    'invalid offset',
    ['normal', ['log'], {
      INVALID_OFFSET: 'true'
    }],
    /offset must be a number/,
    true
  ],
  [
    'sub offset',
    ['normal', ['log'], {
      SUB_OFFSET: 'true'
    }],
    /on sub command/,
    true
  ],
  [
    'invalid load',
    ['normal', ['log'], {
      INVALID_LOAD: 'true'
    }],
    /should exist and be a directory/,
    true
  ],
  [
    'duplicate alias',
    ['normal', ['log'], {
      DUPLICATE_ALIAS: 'true'
    }],
    /already an alias of command/,
    true
  ]
]

CASES.forEach(([
  // description
  d,
  // [type, argv, env]
  args,
  // expected
  ex,
  // has error
  err
]) => {
  test(`${args[0]}: ${d}`, async t => {
    if (err) {
      await t.throwsAsync(() => run(...args), ex)
      return
    }

    const content = await run(...args)

    t.is(
      content,
      Object(ex) === ex
        ? JSON.stringify(ex)
        : ex
    )
  })
})
