var mapnik = require('mapnik');
var Tile = require('tilelive').stream.Tile;
var path = require('path');
var zlib = require('zlib');

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'geojson.input'));

module.exports.makeTile = function(t, callback) {
  var geojson = {
    "type": "FeatureCollection",
    "features": t.features
  };

  var vtile = new mapnik.VectorTile(t.xyz[2],t.xyz[0],t.xyz[1]);
  vtile.addGeoJSON(JSON.stringify(geojson), "now");

  zlib.gzip(vtile.getData(), function(err, buffer) {
    if (err) return callback(err);
    var tile = new Tile(t.xyz[2], t.xyz[0], t.xyz[1], buffer);
    tile.buffer = tile.buffer.toString('base64');
    return callback(null, JSON.stringify(tile));
  });
}