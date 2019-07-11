[![Build Status](https://travis-ci.org/kaelzhang/bin-tool.svg?branch=master)](https://travis-ci.org/kaelzhang/bin-tool)
[![Coverage](https://codecov.io/gh/kaelzhang/bin-tool/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/bin-tool)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/bin-tool?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/bin-tool)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/bin-tool.svg)](http://badge.fury.io/js/bin-tool)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/bin-tool.svg)](https://www.npmjs.org/package/bin-tool)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/bin-tool.svg)](https://david-dm.org/kaelzhang/bin-tool)
-->

# bin-tool

The utility tool to create powerful command line tools

## Install

```sh
$ npm i bin-tool
```

## Usage

For example with annotations, see [example](example)

```
/path/to/project
    |-- cli.js
    |-- commands
        |-- serve.js
    |-- package.json
```

cli.js
```js
const {Command} = require('bin-tool')
const path = require('path')

class Bin extends Command {
  constructor () {
    this.load(path.join(__dirname, 'commands'))
  }
}

new Bin().start()
```

serve.js

```js
const {Command} = require('bin-tool')

module.exports = class extends Command {
  constructor () {
    this.options = {
      port: {
        type: 'number',
        default: 3000,
        description: 'port to bind on'
      }
    }
  }

  run ({argv}) {
    serve(argv.port)
  }
}
```

package.json

```json
{
  "name": "bin",
  "bin": {
    "bin": "./cli"
  }
}
```

```sh
npm link
bin serve --port 8080
```

## new Command(argv = process.argv)

- **argv** `Array` specify the process argv

In most cases, we leave the `argv` unspecified to use the default value `process.argv` except for test purpose.

### load(path): this

- **path** `string` the full absolute path of the directory that contains sub commands

Load subtle commands

### setter: offset `number`

Set the offset of `process.argv` defaults to `2`

### setter: options `object`

Set the options of the command

### setter: usage `string`

Set the usage of the command

### setter: version `string`

Set the semantic version of the command

### override: run({cwd, argv, rawArgv}): void | Promise

- **cwd** the current working directory which equals to `process.cwd()`
- **argv** `object` the parsed argv object
- **rawArgv** `Array` the raw process argv

The method to override to define the behavior of the current command. If the method is not overridden, it will [`showHelp()`](#showhelp)

The `argv` object has a special `argv.__` property which contains the arguments after `'--'`

### alias(alias, commandName): this

- **alias** `string` the alias name of the command
- **commandName** `string` the original command name

Add an alias name for a command `commandName`

### async start(): void

Start the command

### errHandler(err)

Handle an error

### showHelp()

Print help message of the current command to stdout

## License

[MIT](LICENSE)
