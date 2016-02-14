var fs   = require("fs"),
    path = require("path");

var moment  = require("moment"),
    debug   = require("debug")("autoingesttool::financial_reporter.js"),
    async   = require("async"),
    request = require("request"),
    _       = require("lodash"),
    clone   = require("clone");

var JSONFileLoader = require("./json_file_loader"),
    Helpers        = require("./helpers"),
    Constants      = require("./constants");

var InvalidParametersError = require("../errors/invalid_parameters_error"),
    InvalidPathsError      = require("../errors/invalid_paths_error");

var financialReportSchema = JSONFileLoader.loadFileSync("financial_report", "schema"),
    pathsSchema           = JSONFileLoader.loadFileSync("paths", "schema");

module.exports = {
    downloadFinancialReport: downloadFinancialReport
};

function downloadFinancialReport(params, paths, callback) {
    var filename;

    async.waterfall(
        [
            function (next) {
                _validateData(params, paths, next);
            },
            function (next) {
                Helpers.createDirectories(paths, next);
            },
            function (next) {
                var elements = [params.vendor_number, params.region_code, params.report_type, params.fiscal_year, params.fiscal_period];

                filename = Helpers.join(elements, "_");

                debug("Filename: %s", filename);

                next();
            },
            function (next) {
                _downloadReportArchive(filename, params, paths, next);
            },
            function (next) {
                Helpers.extractReportArchive(filename, paths, next);
            },
            function (next) {
                _transformTextReportToJson(filename, paths, next);
            }
        ],
        function (err) {
            callback(err, paths)
        }
    );
}

/* ---------------------------------------------------------------------- */

function _validateData(params, paths, callback) {
    var errors;

    errors = Helpers.validateJSON("financial_report", params, financialReportSchema);

    if (errors) {
        return callback(new InvalidParametersError("Please enter all the required parameters. For help, please download the latest User Guide from the Payments and Financial module in iTunes Connect.", errors));
    }

    errors = Helpers.validateJSON("paths", paths, pathsSchema);

    if (errors) {
        return callback(new InvalidPathsError("Please enter all the required path parameters.", errors));
    }

    callback();
}

function _downloadReportArchive(filename, params, paths, callback) {
    var stream;
    var data = {
        USERNAME: params.username,
        PASSWORD: params.password,
        VNDNUMBER: params.vendor_number,
        TYPEOFREPORT: params.report_type,
        DATETYPE: params.region_code,
        REPORTTYPE: params.fiscal_year,
        REPORTDATE: params.fiscal_period
    };

    debug(data);

    paths.archive = path.join(paths.archive, filename) + Constants.TEXT_EXT + Constants.GZIP_EXT;

    debug(paths.archive);

    if (fs.existsSync(paths.archive)) {
        return callback();
    }

    debug("Archive file will be downloaded shortly ...");

    stream = fs.createWriteStream(paths.archive);

    request
        .post(Constants.ITUNES_CONNECT_REPORTING_URL)
        .form(data)
        .pipe(stream);

    stream.on("error", callback);
    stream.on("finish", __finished);

    function __finished() {
        debug("Archive downloaded successfully!");

        Helpers.isFileEmpty(paths.archive, callback);
    }
}

function _transformTextReportToJson(filename, paths, callback) {
    paths.json_report = path.join(paths.json_report, filename + Constants.JSON_EXT);

    debug(paths.json_report);

    if (fs.existsSync(paths.json_report)) {
        return callback();
    }

    async.waterfall(
        [
            function (next) {
                Helpers.readFile(paths.report, {encoding: "utf8"}, next);
            },
            function (data, next) {
                _createJSON(data, next);
            },
            function (json, next) {
                Helpers.writeFile(paths.json_report, JSON.stringify(json), {encoding: "utf8"}, next);
            }
        ],
        function (err) {
            if (err)
                return callback(err);

            debug("Text data transformed successfully to JSON!");

            callback();
        }
    );
}

function _createJSON(data, callback) {
    var headersArray, headersLength;
    var json          = [],
        headersObject = {},
        totalObject   = {},
        count         = 0,
        lines         = data.split("\n");

    async.eachSeries(
        lines,
        function (line, next) {
            var items = line.split("\t");

            if (items.length === 0)
                return next();

            if (count === 0) {
                count += 1;

                headersArray = items;
                headersLength = items.length;

                _.forEach(items, function (item) {
                    headersObject[item.replace(/[ -]/g, "").replace(/\//g, "_")] = null;
                });

                debug(headersObject);
            } else {
                var element;

                if (_.includes(items[0].toLowerCase(), "total")) {
                    totalObject[items[0].replace(/_/g, "")] = items[1];
                } else {
                    element = clone(headersObject);

                    _.forEach(items, function (value, index) {
                        if (value && value !== " ") {
                            element[headersArray[index].replace(/[ -]/g, "").replace(/\//g, "_")] = value;
                        }
                    });

                    json.push(element);
                }
            }

            next();
        },
        function (err) {
            if (err) {
                return callback(err);
            }

            json.push(totalObject);

            callback(null, json);
        }
    );
}
