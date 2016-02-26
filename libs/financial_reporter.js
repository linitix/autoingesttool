var fs   = require("fs"),
    path = require("path");

var moment  = require("moment"),
    debug   = require("debug")("autoingesttool::financial_reporter.js"),
    async   = require("async"),
    request = require("request"),
    _       = require("lodash");

var JSONFileLoader = require("./json_file_loader"),
    Helpers        = require("./helpers");

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
                var elements = [ params.vendor_number, params.region_code, params.report_type, params.fiscal_year,
                    params.fiscal_period ];

                filename = Helpers.join(elements, "_");

                debug("Filename: %s", filename);

                next();
            },
            function (next) {
                var data = {
                    USERNAME: params.username,
                    PASSWORD: params.password,
                    VNDNUMBER: params.vendor_number,
                    TYPEOFREPORT: params.report_type,
                    DATETYPE: params.region_code,
                    REPORTTYPE: params.fiscal_year,
                    REPORTDATE: params.fiscal_period
                };

                Helpers.downloadReportArchive(filename, data, paths, next);
            },
            function (next) {
                Helpers.extractReportArchive(filename, paths, next);
            },
            function (next) {
                Helpers.transformTextReportToJson(filename, paths, next);
            }
        ],
        function (err) { callback(err, paths); }
    );
}

/* ---------------------------------------------------------------------- */

function _validateData(params, paths, callback) {
    var errors;

    errors = Helpers.validateJSON("financial_report", params, financialReportSchema);

    if ( errors ) {
        return callback(new InvalidParametersError("Please enter all the required parameters. For help, please download the latest User Guide from the Payments and Financial module in iTunes Connect.", errors));
    }

    errors = Helpers.validateJSON("paths", paths, pathsSchema);

    if ( errors ) {
        return callback(new InvalidPathsError("Please enter all the required path parameters.", errors));
    }

    callback();
}
