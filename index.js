var util = require('util');
var path = require('path');
var zlib = require('zlib');
var mapnik = require('mapnik');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var tiler = require('./lib/tiler');
var inflator = require('./lib/inflator');

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'geojson.input'));

module.exports = function() {
  var parentHolder = {};

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) { Transform.call(this, minZ); this.minZ = minZ; }

  InflateStream.prototype._transform = function(chunk, enc, callback) {
    var inflateStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }

    inflateStream.push(inflator(data));
    minZ = inflateStream.minZ || (data.qt.length-1)/2;

    if ((data.qt.length-1)/2 > minZ) agg(data);

    function agg(data) {
      var parent = data.qt.substring(0, data.qt.length-2);

      if (parentHolder[parent]) {
        parentHolder[parent].aggregate(data.attributes);
      } else {
        parentHolder[parent] = new Aggregator();
        parentHolder[parent].initialize(parent, data.attributes, function(err, child, pID) {
          if (err) throw err;

          var pdata = { "qt": pID, "attributes": child };
          inflateStream.push(inflator(pdata));

          if ((pID.length-1)/2 >= minZ) agg(pdata);

          parentHolder[pID] = {};
        });
      }
    }
    callback();
  };

  util.inherits(LayTileStream, Transform);
  function LayTileStream(delta) {
    Transform.call(this, delta);
    this.delta = delta;
    this.tileHolder = new tiler.Tiler(delta);
  }

  LayTileStream.prototype._transform = function(chunk, enc, callback) {
    var layTileStream = this;
    var data;
    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(err); }

    delta = layTileStream.delta;
    tileHolder = layTileStream.tileHolder;

    var qti = data.properties.qt.match(/[0-9]/g).join('');
    var tileQuad = qti.substring(0, qti.length - tileHolder.zoomDelta);

    if (tileHolder.tiles[tileQuad]) {
      tileHolder.tiles[tileQuad].addFeature(data);
    } else {
      tileHolder.tiles[tileQuad] = new tiler.Tile();
      tileHolder.tiles[tileQuad].initialize(data, tileQuad, tileHolder.featureCount, function(err, tileObj) {
        if (err) throw err;
        layTileStream.push(makeTile(tileObj));
      });
    }
    callback();
  };

  util.inherits(CleanStream, Transform);
  function CleanStream(options) { Transform.call(this, options); }

  CleanStream.prototype._transform = function(chunk, enc, callback) {
    if (!chunk.toString()) { return callback(); }

    var data;

    try {
      data = JSON.parse(chunk);
    } catch(err) { callback(); }

    this.push(JSON.stringify(data));

    callback();
  };

  return {
    inflate: function(value) { return new InflateStream(value); },
    tile: function(delta) { return new LayTileStream(delta); },
    clean: function(options) { return new CleanStream(options); }
  };
};

function makeTile(t) {
  var geojson = {
    "type": "FeatureCollection",
    "features": t.features
  };

  var vtile = new mapnik.VectorTile(t.xyz[2],t.xyz[0],t.xyz[1]);
  vtile.addGeoJSON(JSON.stringify(geojson), "now");

  var obj = {
    z: t.xyz[2],
    x: t.xyz[0],
    y: t.xyz[1],
    buffer: vtile.getData().toString('base64')
  };

  return JSON.stringify(obj);
}
