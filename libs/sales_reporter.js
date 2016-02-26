var fs   = require("fs"),
    path = require("path");

var moment = require("moment"),
    debug  = require("debug")("autoingesttool::sales_reporter.js"),
    async  = require("async"),
    _      = require("lodash");

var JSONFileLoader = require("./json_file_loader"),
    Helpers        = require("./helpers");

var InvalidParametersError = require("../errors/invalid_parameters_error"),
    InvalidPathsError      = require("../errors/invalid_paths_error");

var DAILY_DATE_FORMAT = "YYYYMMDD";

var salesReportSchema = JSONFileLoader.loadFileSync("sales_report", "schema"),
    pathsSchema       = JSONFileLoader.loadFileSync("paths", "schema");

module.exports = {
    downloadSalesReport: downloadSalesReport
};

function downloadSalesReport(params, paths, callback) {
    var filename;

    if ( !params.report_date ) {
        params.report_date = moment().subtract(1, "days").format(DAILY_DATE_FORMAT);
    }

    async.waterfall(
        [
            function (next) {
                _validateData(params, paths, next);
            },
            function (next) {
                Helpers.createDirectories(paths, next);
            },
            function (next) {
                var elements = [ params.report_type, params.report_subtype, params.date_type, params.vendor_number,
                    params.report_date ];

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
                    DATETYPE: params.date_type,
                    REPORTTYPE: params.report_subtype,
                    REPORTDATE: params.report_date
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
        function (err) {
            callback(err, paths);
        }
    );
}

/* ---------------------------------------------------------------------- */

function _validateData(params, paths, callback) {
    var errors;

    errors = Helpers.validateJSON("sales_report", params, salesReportSchema);

    if ( errors ) {
        return callback(new InvalidParametersError("Please enter all the required parameters. For help, please download the latest User Guide from the Sales and Trends module in iTunes Connect.", errors));
    }

    errors = Helpers.validateJSON("paths", paths, pathsSchema);

    if ( errors ) {
        return callback(new InvalidPathsError("Please enter all the required path parameters.", errors));
    }

    callback();
}
