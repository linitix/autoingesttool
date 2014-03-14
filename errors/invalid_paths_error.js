var util = require("util");

var AbstractError = require("./abstract_error");

util.inherits(InvalidPathsError, AbstractError);

function InvalidPathsError(message, paths) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Invalid Paths Error";
    this.paths = paths;
}

module.exports = InvalidPathsError;
