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

TE('INVALID_DESC', 'description must be a string')

E('INVALID_OPTION_GROUPS', `optionGroups should be an array of OptionGroup

  interface OptionGroup {
    title: string
    options: Array<string>
  }
`)

TE('INVALID_USAGE_RETURN_TYPE', 'usage of function type must return a string')

E('ALIAS_CONFLICT',
  '"%s" is already an alias of "%s"')

E('COMMAND_ALIAS_CONFLICT',
  '"%s" is already an alias of command "%s"')

E('SUB_OFFSET_NOT_ALLOWED', 'setting offset on sub command is not allowed')

E('INVALID_LOAD_PATH', '"%s" should exist and be a directory')

module.exports = error
