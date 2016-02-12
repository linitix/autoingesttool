var fs   = require("fs"),
    zlib = require("zlib");

var debug  = require("debug")("autoingesttool::helpers.js"),
    async  = require("async"),
    mkdirp = require("mkdirp");

var JSONValidator = require("./json_validator");

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
    writeFile: writeFile
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
