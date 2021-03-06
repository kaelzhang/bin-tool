const test = require('ava')
// const log = require('util').debuglog('bin-tool')
const {run} = require('./run')

const DOUBLE_DASH = '--'

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
      [DOUBLE_DASH]: ['--no-limit']
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
      [DOUBLE_DASH]: []
    }
  ],
  [
    '__ (double underscores)',
    ['normal', ['log', '--__', 'foo'], {
      DOUBLE_UNDERSCORE: 'true'
    }],
    {
      __: 'foo'
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
    'invalid option groups',
    ['normal', ['log'], {
      INVALID_OPTION_GROUPS: 'true'
    }],
    /OptionGroup/,
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
  ],
  [
    '--help, options always fail',
    ['help', ['--help']],
    'help'
  ],
  [
    '-h, options always fail',
    ['help', ['--help']],
    'help'
  ],
  [
    'help defined, options always fail',
    ['help', ['--help', '--prop'], {
      HELP_DEFINED: true
    }],
    /fail/,
    true
  ],
  [
    'optionGroups',
    ['help', ['--help'], {
      OPTION_GROUPS: true
    }],
    `bin [options]

Options:
  --prop

Foo:
  --foo`
  ],
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

test('help', async t => {
  const content = await run('normal', ['log', '--help'], {
    HAS_DESCRIPTION: 'true'
  })

  t.true(content.startsWith(`bin log [options]

description

Options:
`))
})
