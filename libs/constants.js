var debug = require("debug")("autoingesttool::constants.js");

var env             = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
    username        = process.env.USERNAME ? process.env.USERNAME : null,
    password        = process.env.PASSWORD ? process.env.PASSWORD : null,
    vendorNumber    = process.env.VENDOR_NUMBER ? process.env.VENDOR_NUMBER : null,
    textExt         = ".txt",
    gzipExt         = ".gz",
    jsonExt         = ".json",
    itcReportingUrl = "https://reportingitc.apple.com/autoingestion.tft";

debug("environment >> %s", env);
debug("username >> %s", username);
debug("password >> %s", password);
debug("vendor >> %s", vendorNumber);

module.exports = {
    ENV: env,
    USERNAME: username,
    PASSWORD: password,
    VND_NUMBER: vendorNumber,
    TEXT_EXT: textExt,
    GZIP_EXT: gzipExt,
    JSON_EXT: jsonExt,
    ITUNES_CONNECT_REPORTING_URL: itcReportingUrl
};
