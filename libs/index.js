var async = require("async");
var mkdirp = require("mkdirp");
var jsonschema = require("jsonschema");
var request = require("request");

var Configurator = require("./configurator");
var InvalidParametersError = require("../errors/invalid_parameters_error");
var InvalidPathsError = require("../errors/invalid_paths_error");
var EmptyFileError = require("../errors/empty_file_error");

var parametersSchema = Configurator.loadSync("parameters_schema");
var pathsSchema = Configurator.loadSync("paths_schema");
var Validator = new jsonschema.Validator();

exports.INVALID_PARAMETERS_ERROR = InvalidParametersError;
exports.INVALID_PATHS_ERROR = InvalidPathsError;
exports.EMPTY_FILE_ERROR = EmptyFileError;
exports.downloadReportInPathsWithParameters = downloadReportInPathsWithParameters;

function downloadReportInPathsWithParameters(parameters, paths, callback) {
    async.waterfall(
        [
            function (callback) {
                validateAllJSON(parameters, paths, callback);
            },
            function (callback) {
                createDirectories(paths, callback);
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            callback(null, result);
        }
    );
}

function createDirectories(paths, callback) {
    async.parallel(
        [
            function (callback) {
                mkdirp(paths.report, callback);
            },
            function (callback) {
                mkdirp(paths.archive, callback);
            }
        ],
        callback
    );
}

function validateAllJSON(parameters, paths, callback) {
    var parametersErrors = validateJSON(parameters, parametersSchema);
    var pathsErrors = validateJSON(paths, pathsSchema);
    var err = null;

    if (parametersErrors) {
        err = new InvalidParametersError(
            "Please enter all the required parameters. For help, please download the latest User Guide from the Sales and Trends module in iTunes Connect.",
            parametersErrors
        );
        return callback(err);
    }

    if (pathsErrors) {
        err = new InvalidPathsError(
            "Please enter all the required path parameters.",
            pathsErrors
        );
        return callback(err);
    }

    callback();
}

function validateJSON(json, schema) {
    var result = Validator.validate(json, schema);

    if (result.errors.length > 0)
        return result.errors;

    return null;
}
