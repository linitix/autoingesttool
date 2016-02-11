var JSONValidator = require("is-my-json-valid"),
    debug         = require("debug")("autoingesttool::json_validator.js");

var CACHE = {};

function validate(name, schema, data)
{
  if ( !CACHE[ name ] )
  {
    CACHE[ name ] = JSONValidator(schema, { verbose: true });

    debug(Object.keys(CACHE));
  }

  CACHE[ name ](data);

  return CACHE[ name ].errors;
}

module.exports = {
  validate: validate
};
