var debug = require("debug")("autoingesttool::index.js");

var SalesReporter     = require("./libs/sales_reporter"),
    FinancialReporter = require("./libs/financial_reporter");

var InvalidParametersError = require("./errors/invalid_parameters_error"),
    InvalidPathsError      = require("./errors/invalid_paths_error"),
    EmptyFileError         = require("./errors/empty_file_error");

module.exports = {
  downloadSalesReport     : SalesReporter.downloadSalesReport,
  downloadFinancialReport : FinancialReporter.downloadFinancialReport,
  INVALID_PARAMETERS_ERROR: InvalidParametersError,
  INVALID_PATHS_ERROR     : InvalidPathsError,
  EMPTY_FILE_ERROR        : EmptyFileError
};
