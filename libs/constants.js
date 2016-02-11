var debug = require("debug")("autoingesttool::constants.js");

var username,
    password;
var env             = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
    textExt         = ".txt",
    gzipExt         = ".gz",
    jsonExt         = ".json",
    itcReportingUrl = "https://reportingitc.apple.com/autoingestion.tft";

debug("environment >> %s", env);

if ( env === "development" )
{
  username = process.env.DEV_USERNAME ? process.env.DEV_USERNAME : null;
  password = process.env.DEV_PASSWORD ? process.env.DEV_PASSWORD : null;

  debug("username >> %s", username);
  debug("password >> %s", password);
}

module.exports = {
  ENV                         : env,
  USR                         : username,
  PWD                         : password,
  TEXT_EXT                    : textExt,
  GZIP_EXT                    : gzipExt,
  JSON_EXT                    : jsonExt,
  ITUNES_CONNECT_REPORTING_URL: itcReportingUrl
};
