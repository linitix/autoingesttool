var path = require("path");
var fs = require("fs");

var async = require("async");
var mkdirp = require("mkdirp");
var jsonschema = require("jsonschema");
var request = require("request");
var moment = require("moment");

var Configurator = require("./configurator");
var InvalidParametersError = require("../errors/invalid_parameters_error");
var InvalidPathsError = require("../errors/invalid_paths_error");
var EmptyFileError = require("../errors/empty_file_error");

var TXT_EXT = ".txt";
var JSON_EXT = ".json";
var GZIP_EXT = ".gz";
var ITUNES_CONNECT_REPORTING_URL = "https://reportingitc.apple.com/autoingestion.tft";

var parametersSchema = Configurator.loadSync("parameters_schema");
var pathsSchema = Configurator.loadSync("paths_schema");
var fileNamePrefix = Configurator.loadSync("filename_prefix");
var Validator = new jsonschema.Validator();

exports.INVALID_PARAMETERS_ERROR = InvalidParametersError;
exports.INVALID_PATHS_ERROR = InvalidPathsError;
exports.EMPTY_FILE_ERROR = EmptyFileError;
exports.downloadReportInPathsWithParameters = downloadReportInPathsWithParameters;

function downloadReportInPathsWithParameters(parameters, paths, callback) {
    if (!parameters.report_date)
        parameters["report_date"] = moment().format("YYYYMMDD");

    async.waterfall(
        [
            function (callback) {
                validateAllJSON(parameters, paths, callback);
            },
            function (callback) {
                createDirectories(paths, callback);
            },
            function (callback) {
                generateFileName(parameters, callback);
            },
            function (fileName, callback) {
                downloadReportArchive(fileName, parameters, paths, callback);
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            callback(null, result);
        }
    );
}

function downloadReportArchive(fileName, parameters, paths, callback) {
    var data = {
        USERNAME: parameters.username,
        PASSWORD: parameters.password,
        VNDNUMBER: parameters.vendor_number,
        TYPEOFREPORT: parameters.report_type,
        DATETYPE: parameters.date_type,
        REPORTTYPE: parameters.report_subtype,
        REPORTDATE: parameters.report_date
    };
    var archiveStream = null;

    paths.archive = path.join(paths.archive, fileName + TXT_EXT + GZIP_EXT);

    if (fs.existsSync(paths.archive))
        return callback(null, fileName);

    archiveStream = fs.createWriteStream(paths.archive);

    request.post(ITUNES_CONNECT_REPORTING_URL).form(data).pipe(archiveStream);

    archiveStream.on("error", callback);
    archiveStream.on(
        "finish",
        function () {
            isArchiveFileEmpty(
                paths.archive,
                function (err) {
                    if (err) return callback(err);

                    callback(null, fileName);
                }
            )
        }
    );
}

function isArchiveFileEmpty(archivePath, callback) {
    fs.stat(
        archivePath,
        function (err, stats) {
            if (err) return callback(err);

            if (stats.size === 0) {
                fs.unlink(
                    archivePath,
                    function (err) {
                        if (err) return callback(err);

                        callback(new EmptyFileError("The report you requested is not available at this time. Please try again in a few minutes."));
                    }
                );
            } else {
                callback();
            }
        }
    );
}

function generateFileName(parameters, callback) {
    var prefixArray = [ parameters.report_type, parameters.report_subtype, parameters.date_type ];
    var prefixString = prefixArray.join("_");
    var fileName = null;

    if (!fileNamePrefix[prefixString])
        return callback(new InvalidParametersError("Please enter all the required parameters. For help, please download the latest User Guide from the Sales and Trends module in iTunes Connect."));

    fileName = fileNamePrefix[prefixString] + "_" + parameters.vendor_number + "_" + parameters.report_date;

    callback(null, fileName);
}

function createDirectories(paths, callback) {
    var keys = Object.keys(paths);

    async.each(
        keys,
        function (key, callback) {
            mkdirp(paths[key], callback);
        },
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
