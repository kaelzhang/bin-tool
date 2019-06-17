const {Errors} = require('err-object')

const {E, TE, error} = new Errors({
  messagePrefix: '[bin-tool] ',
  codePrefix: 'BIN_TOOL'
})

TE('INVALID_OPTIONS', 'options must be an object')

TE('INVALID_OFFSET', 'offset must be a number')

TE('INVALID_OPTION', 'options.%s must be an object')

TE('INVALID_ALIAS',
  'options.%s.alias should be undefined, string or array of strings')

TE('INVALID_USAGE', 'usage must be string or function')
TE('INVALID_USAGE_RETURN_TYPE', 'usage of function type must return a string')

E('ALIAS_CONFLICT',
  '"%s" is already an alias of "%s"')

module.exports = error
