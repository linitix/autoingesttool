var fs   = require("fs"),
    zlib = require("zlib"),
    path = require("path");

var debug   = require("debug")("autoingesttool::helpers.js"),
    async   = require("async"),
    mkdirp  = require("mkdirp"),
    clone   = require("clone"),
    _       = require("lodash"),
    request = require("request");

var JSONValidator = require("./json_validator"),
    Constants     = require("./constants");

var EmptyFileError = require("../errors/empty_file_error");

module.exports = {
    zeroFill: zeroFill,
    validateJSON: validateJSON,
    createDirectories: createDirectories,
    join: join,
    isFileEmpty: isFileEmpty,
    removeFile: removeFile,
    decompressRawBufferWithGunzip: decompressRawBufferWithGunzip,
    readFile: readFile,
    writeFile: writeFile,
    extractReportArchive: extractReportArchive,
    transformTextReportToJson: transformTextReportToJson,
    downloadReportArchive: downloadReportArchive
};

function zeroFill(num) {
    return (num < 10 ? "0" : "") + num;
}

function validateJSON(name, json, schema) {
    return JSONValidator.validate(name, schema, json);
}

function createDirectories(paths, callback) {
    var keys = Object.keys(paths);

    debug(keys);

    async.each(
        keys,
        function (key, next) {
            mkdirp(paths[key], next);
        },
        callback
    );
}

function join(elements, separator) {
    return elements.join(separator);
}

function isFileEmpty(path, callback) {
    debug("Check file: %s", path);

    fs.stat(
        path,
        function (err, stats) {
            if (err) {
                return callback(err);
            }

            debug(stats);

            if (stats.size !== 0) {
                return callback();
            }

            removeFile(path, function (err) {
                if (err) {
                    return callback(err);
                }

                callback(new EmptyFileError("The report you requested is not available at this time. Please try again in a few minutes."));
            });
        });
}

function removeFile(path, callback) {
    fs.unlink(path, callback);
}

function decompressRawBufferWithGunzip(buffer, callback) {
    zlib.gunzip(buffer, callback);
}

function readFile(path, options, callback) {
    fs.readFile(path, options, callback);
}

function writeFile(path, data, options, callback) {
    fs.writeFile(path, data, options, callback);
}

function extractReportArchive(filename, paths, callback) {
    var stream;
    var archiveBuffer = fs.readFileSync(paths.archive);

    paths.report = path.join(paths.report, filename + Constants.TEXT_EXT);

    debug(paths.report);

    if (fs.existsSync(paths.report)) {
        return callback();
    }

    stream = fs.createWriteStream(paths.report);

    stream.on("error", callback);
    stream.on("finish", extracted);

    function extracted() {
        debug("Archive extracted successfully!");

        callback();
    }

    decompressRawBufferWithGunzip(archiveBuffer, function (err, data) {
        if (err) {
            return callback(err);
        }

        stream.end(data.toString(), "utf8");
    });
}

function transformTextReportToJson(filename, paths, callback) {
    paths.json_report = path.join(paths.json_report, filename + Constants.JSON_EXT);

    debug(paths.json_report);

    if (fs.existsSync(paths.json_report)) {
        return callback();
    }

    async.waterfall(
        [
            function (next) {
                readFile(paths.report, {encoding: "utf8"}, next);
            },
            function (data, next) {
                _createJSON(data, next);
            },
            function (json, next) {
                writeFile(paths.json_report, JSON.stringify(json), {encoding: "utf8"}, next);
            }
        ],
        function (err) {
            if (err)
                return callback(err);

            debug("Text data transformed successfully to JSON!");

            callback();
        }
    );
}

function downloadReportArchive(filename, data, paths, callback) {
    var stream;

    debug(data);

    paths.archive = path.join(paths.archive, filename) + Constants.TEXT_EXT + Constants.GZIP_EXT;

    debug(paths.archive);

    if (fs.existsSync(paths.archive)) {
        return callback();
    }

    debug("Archive file will be downloaded shortly ...");

    stream = fs.createWriteStream(paths.archive);

    request
        .post(Constants.ITUNES_CONNECT_REPORTING_URL)
        .form(data)
        .pipe(stream);

    stream.on("error", callback);
    stream.on("finish", downloaded);

    function downloaded() {
        debug("Archive downloaded successfully!");

        isFileEmpty(paths.archive, callback);
    }
}

/* ------------------------------------------------------------------------------ */

function _createJSON(data, callback) {
    var headersArray, headersLength;
    var json          = [],
        headersObject = {},
        totalObject   = {},
        financial     = false,
        count         = 0,
        lines         = data.split("\n");

    async.eachSeries(
        lines,
        function (line, next) {
            var items = line.split("\t");

            if (items.length === 0)
                return next();

            if (count === 0) {
                count += 1;

                headersArray = items;
                headersLength = items.length;

                _.forEach(items, function (item) {
                    headersObject[item.replace(/[ -]/g, "").replace(/\//g, "_")] = null;
                });

                debug(headersObject);
            } else {
                var element;

                if (_.includes(items[0].toLowerCase(), "total")) {
                    totalObject[items[0].replace(/_/g, "")] = items[1];
                    financial = true;
                } else {
                    element = clone(headersObject);

                    _.forEach(items, function (value, index) {
                        if (value && value !== " ") {
                            element[headersArray[index].replace(/[ -]/g, "").replace(/\//g, "_")] = value;
                        }
                    });

                    json.push(element);
                }
            }

            next();
        },
        function (err) {
            if (err) {
                return callback(err);
            }

            if (financial)
                json.push(totalObject);

            callback(null, json);
        }
    );
}
