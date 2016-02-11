var vows   = require("vows"),
    should = require("should");

var suite = vows.describe("Download daily sales report");

suite.addBatch({
  "when downloading the latest sales report": {}
});

suite.export(module);
