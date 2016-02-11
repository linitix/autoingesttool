var path = require("path");

var vows   = require("vows"),
    should = require("should"),
    moment = require("moment");

var AutoIngestTool = require("../index"),
    Constants      = require("../libs/constants");

var TMP_DIR = path.join(__dirname, "..", "tmp");

var suite = vows.describe("Download daily sales report");

suite.addBatch({
    "when downloading the latest available daily sales report": {
        topic: function () {
            var paths  = {
                    archive: TMP_DIR,
                    report: TMP_DIR,
                    json_report: TMP_DIR
                },
                params = {
                    username: Constants.USERNAME,
                    password: Constants.PASSWORD,
                    vendor_number: Constants.VND_NUMBER,
                    report_type: "Sales",
                    report_subtype: "Summary",
                    date_type: "Daily",
                    report_date: moment().subtract(1, "days").format("YYYYMMDD")
                };

            AutoIngestTool.downloadSalesReport(params, paths, this.callback);
        },
        "we receive the sales report archive file": function (err, paths) {
            return true;
        },
        "we receive the sales report extracted text file": function (err, paths) {
            return true;
        },
        "we receive the created sales report JSON file": function (err, paths) {
            return true;
        }
    }
});

suite.export(module);
