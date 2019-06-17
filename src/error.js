const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  messagePrefix: '[bin-tool] ',
  codePrefix: 'BIN_TOOL'
})

TE('INVALID_OPTIONS', 'options must be an object')

TE('INVALID_OPTION', 'options.%s must be an object')

TE('INVALID_ALIAS',
  'options.%s.alias should be undefined, string or array of strings')

E('ALIAS_CONFLICT',
  '"%s" (`options.%s.alias`) is already an alias of "%s"')

module.exports = error
