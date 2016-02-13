var util = require("util");

var AbstractError = require("./abstract_error");

function InvalidPathsError(message, paths) {
    AbstractError.call(this, message, this.constructor);
    this.name = "Invalid Paths Error";
    this.paths = paths;
}

util.inherits(InvalidPathsError, AbstractError);

module.exports = InvalidPathsError;
