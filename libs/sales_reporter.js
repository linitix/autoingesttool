var fs   = require("fs"),
    path = require("path");

var moment  = require("moment"),
    debug   = require("debug")("autoingesttool::sales_reporter.js"),
    async   = require("async"),
    request = require("request"),
    _       = require("lodash"),
    clone   = require("clone");

var JSONFileLoader = require("./json_file_loader"),
    Helpers        = require("./helpers"),
    Constants      = require("./constants");

var InvalidParametersError = require("../errors/invalid_parameters_error");

var DAILY_DATE_FORMAT = "YYYYMMDD";

var salesReportSchema = JSONFileLoader.loadFileSync("sales_report", "schema"),
    pathsSchema       = JSONFileLoader.loadFileSync("paths", "schema");

module.exports = {
  downloadSalesReport: downloadSalesReport
};

function downloadSalesReport(params, paths, callback)
{
  var filename;

  if ( !params.report_date )
  {
    params.report_date = moment().format(DAILY_DATE_FORMAT);
  }

  async.waterfall(
    [
      function (next)
      {
        _validateData(params, paths, next);
      },
      function (next)
      {
        Helpers.createDirectories(paths, next);
      },
      function (next)
      {
        var elements = [ params.report_type, params.report_subtype, params.date_type, params.vendor_number,
          params.report_date ];

        filename = Helpers.join(elements, "_");

        debug("Filename: %s", filename);

        next();
      },
      function (next)
      {
        _downloadReportArchive(filename, params, paths, next);
      },
      function (next)
      {
        _extractReportArchive(filename, paths, next);
      },
      function (next)
      {
        _transformTextReportToJson(filename, paths, next);
      }
    ],
    function (err) { callback(err); }
  );
}

/* ---------------------------------------------------------------------- */

function _validateData(params, paths, callback)
{
  var errors;

  errors = Helpers.validateJSON("sales_report", params, salesReportSchema);

  if ( errors )
  {
    return callback(new InvalidParametersError("Please enter all the required parameters. For help, please download the latest User Guide from the Sales and Trends module in iTunes Connect.", errors));
  }

  errors = Helpers.validateJSON("paths", paths, pathsSchema);

  if ( errors )
  {
    return callback(new InvalidPathsError("Please enter all the required path parameters.", errors));
  }

  callback();
}

function _downloadReportArchive(filename, params, paths, callback)
{
  var stream;
  var data = {
    USERNAME    : params.username,
    PASSWORD    : params.password,
    VNDNUMBER   : params.vendor_number,
    TYPEOFREPORT: params.report_type,
    DATETYPE    : params.date_type,
    REPORTTYPE  : params.report_subtype,
    REPORTDATE  : params.report_date
  };

  debug(data);

  paths.archive = path.join(paths.archive, filename) + Constants.TEXT_EXT + Constants.GZIP_EXT;

  debug(paths);

  if ( fs.existsSync(paths.archive) )
  {
    return callback();
  }

  stream = fs.createWriteStream(paths.archive);

  request
    .post(Constants.ITUNES_CONNECT_REPORTING_URL)
    .form(data)
    .pipe(stream);

  stream.on("error", callback);
  stream.on("finish", __finished);

  function __finished() { Helpers.isFileEmpty(paths.archive, callback); }
}

function _extractReportArchive(filename, paths, callback)
{
  var stream;
  var archiveBuffer = fs.readFileSync(paths.archive);

  paths.report = path.join(paths.report, filename + Constants.TEXT_EXT);

  debug(paths);

  if ( fs.existsSync(paths.report) )
  {
    return callback();
  }

  stream = fs.createWriteStream(paths.report);

  stream.on("error", callback);
  stream.on("finish", __finished);

  function __finished() { callback(); }

  Helpers.decompressRawBufferWithGunzip(archiveBuffer, function (err, data)
  {
    if ( err )
    {
      return callback(err);
    }

    stream.end(data.toString(), "utf8");
  });
}

function _transformTextReportToJson(filename, paths, callback)
{
  paths.json_report = path.join(paths.json_report, filename + Constants.JSON_EXT);

  debug(paths);

  if ( fs.existsSync(paths.json_report) )
  {
    return callback();
  }

  async.waterfall(
    [
      function (next)
      {
        Helpers.readFile(paths.report, { encoding: "utf8" }, next);
      },
      function (data, next)
      {
        _createJSON(data, next);
      },
      function (json, next)
      {
        Helpers.writeFile(paths.json_report, JSON.stringify(json), { encoding: "utf8" }, next);
      }
    ],
    function (err) { callback(err); }
  );
}

function _createJSON(data, callback)
{
  var headersArray, headersLength;
  var json          = [],
      headersObject = {},
      count         = 0,
      lines         = data.split("\n");

  async.eachSeries(
    lines,
    function (line, next)
    {
      var items = line.split("\t");

      if ( count === 0 )
      {
        count += 1;

        headersArray  = items;
        headersLength = items.length;

        _.forEach(items, function (item)
        {
          headersObject[ item.replace(/ /g, "") ] = null;
        });

        debug(headersObject);
      }
      else
      {
        var element = clone(headersObject);

        _.forEach(items, function (value, index)
        {
          if ( value && value !== " " )
          {
            element[ headersArray[ index ].replace(/ /g, "") ] = value;
          }
        });

        json.push(element);
      }
    },
    function (err)
    {
      if ( err )
      {
        return callback(err);
      }

      json.pop();

      callback(null, json);
    }
  );
}
