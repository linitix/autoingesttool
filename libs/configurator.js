var fs = require("fs");
var path = require("path");

var CONFIG_FILES_PATH = path.join(__dirname, "..", "configs");
var CACHE = {};

exports.loadSync = function (fileName) {
    if (!CACHE[fileName]) {
        var filePath = path.join(CONFIG_FILES_PATH, fileName + ".json");
        var fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
        CACHE[fileName] = JSON.parse(fileContent);
    }

    return CACHE[fileName];
};
