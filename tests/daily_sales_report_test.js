var path = require("path"),
    fs   = require("fs");

var vows   = require("vows"),
    should = require("should"),
    moment = require("moment");

var AutoIngestTool = require("../index");

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
                    username: process.env.USERNAME,
                    password: process.env.PASSWORD,
                    vendor_number: process.env.VENDOR_NUMBER,
                    report_type: "Sales",
                    report_subtype: "Summary",
                    date_type: "Daily",
                    report_date: moment().subtract(2, "days").format("YYYYMMDD")
                };

            AutoIngestTool.downloadSalesReport(params, paths, this.callback);
        },
        "we can open the JSON file": {
            topic: function (paths) {
                fs.readFile(paths.json_report, {encoding: "utf8"}, this.callback);
            },
            "and parse it": {
                topic: function (data) {
                    return JSON.parse(data);
                },
                "the json should be an array": function (json) {
                    json.should.be.an.Array();
                },
                "the json should not be empty": function (json) {
                    json.should.not.be.empty();
                }
            }
        }
    }
});

suite.export(module);
