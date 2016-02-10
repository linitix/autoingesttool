var util = require("util");

var AbstractError = require("./abstract_error");

function InvalidParametersError(message, parameters) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Invalid Parameters Error";
    this.parameters = parameters;
}

util.inherits(InvalidParametersError, AbstractError);

module.exports = InvalidParametersError;
