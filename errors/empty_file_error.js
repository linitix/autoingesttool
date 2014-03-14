var util = require("util");

var AbstractError = require("./abstract_error");

util.inherits(EmptyFileError, AbstractError);

function EmptyFileError(message) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Empty File Error";
}

module.exports = EmptyFileError;
