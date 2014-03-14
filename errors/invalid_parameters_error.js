var util = require("util");

var AbstractError = require("./abstract_error");

util.inherits(InvalidParametersError, AbstractError);

function InvalidParametersError(message, parameters) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Invalid Parameters Error";
    this.parameters = parameters;
}

module.exports = InvalidParametersError;
