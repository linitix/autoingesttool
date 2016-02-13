var util = require("util");

var AbstractError = require("./abstract_error");

function EmptyFileError(message) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Empty File Error";
}

util.inherits(EmptyFileError, AbstractError);

module.exports = EmptyFileError;
