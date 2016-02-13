var fs   = require("fs"),
    path = require("path");

var debug = require("debug")("autoingesttool::json_file_loader.js");

var CACHE    = {},
    JSON_DIR = path.join(__dirname, "..", "json");

function loadFileSync(name, type)
{
  name = name.toLowerCase();

  if ( !type )
  {
    type = "json";
  }

  type = type.toLowerCase();

  if ( !CACHE[ type ] )
  {
    CACHE[ type ] = {}
  }

  if ( !CACHE[ type ][ name ] )
  {
    var file;

    switch ( type )
    {
      case "schema":
        file = path.join(JSON_DIR, name + "_schema.json");
        break;
      default:
        file = path.join(JSON_DIR, name + ".json");
    }

    CACHE[ type ][ name ] = JSON.parse(fs.readFileSync(file, { encoding: "utf8" }));

    debug(CACHE[ type ][ name ]);
  }

  return CACHE[ type ][ name ];
}

module.exports = {
  loadFileSync: loadFileSync
};
