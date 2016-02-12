var debug = require("debug")("autoingesttool::constants.js");

var env             = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
    textExt         = ".txt",
    gzipExt         = ".gz",
    jsonExt         = ".json",
    itcReportingUrl = "https://reportingitc.apple.com/autoingestion.tft";

debug("environment >> %s", env);

module.exports = {
    ENV: env,
    TEXT_EXT: textExt,
    GZIP_EXT: gzipExt,
    JSON_EXT: jsonExt,
    ITUNES_CONNECT_REPORTING_URL: itcReportingUrl
};
