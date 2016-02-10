var util = require("util");

function AbstractError(message, ctor) {
    Error.captureStackTrace(this, ctor || this);
    this.message = message || "Error";
}

util.inherits(AbstractError, Error);

AbstractError.prototype.name = "Abstract Error";

module.exports = AbstractError;
