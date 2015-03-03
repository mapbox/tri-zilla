var trizilla_tilemaker = require('../lib/maketile');
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;
var zlib = require('zlib');

function tileTester(err, tile) {
  tape('should create a valid vector tile', function(t) {

    if (err) throw (err);
    tile = JSON.parse(tile);

    var parsed = new Buffer(tile.buffer, 'base64');

    zlib.gunzip(parsed, function(err, data) {
      if (err) throw (err);

      t.ok(trizilla_tilemaker, 'data unserialized and gunzipped');
      
      var vtile = new VectorTile(new Protobuf(data));
      var expected = JSON.parse(fs.readFileSync('./test/fixtures/gzip-tiles-features-expected'));

      var actualFeatures = {};
      var actualTypes = [];

      t.equal(vtile.layers.now.extent, 4096, 'layer extent should be the same');

      t.equal(vtile.layers.now.name, 'now', 'layer should have the same name');

      t.equal(vtile.layers.now.length, 50, 'layer should have the same number of features');

      for (var i = 0; i < vtile.layers.now.length; i ++) {
        actualFeatures[JSON.stringify(vtile.layers.now.feature(i).loadGeometry())] = JSON.stringify(vtile.layers.now.feature(i).loadGeometry());
        actualTypes.push(vtile.layers.now.feature(i).type)
      }

      t.deepLooseEqual(actualFeatures, expected, 'layer feature geometries should match');

      var expectedTypes = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

      t.deepLooseEqual(actualTypes, expectedTypes, 'layer feature types should match');

      t.end();
    });
  });
}

fs.readFile('./test/fixtures/laytile-expected', function(err, data) {
  if (err) throw (err);
  trizilla_tilemaker.makeTile(JSON.parse(data), tileTester);
})
