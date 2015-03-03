var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile').VectorTile;
var zlib = require('zlib');

tape('should load, parse, inflate, tile, and serialize a stream', function(t) {
  fs.createReadStream('./test/fixtures/fill-facets-output')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(3, {}))
    .pipe(trizilla.decompress({}))
    .pipe(trizilla.inflate(5))
    .pipe(trizilla.tile(3))
    .pipe(trizilla.gzip())
    .on('data', function(tile) {
      t.ok(trizilla, 'processed, checking');

      tile = JSON.parse(tile);

      var parsed = new Buffer(tile.buffer, 'base64');

      zlib.gunzip(parsed, function(err, data) {
        if (err) throw (err);
        var vtile = new VectorTile(new Protobuf(data));

        t.equal(vtile.layers.now.extent, 4096, 'layer extent should be the same');

        t.equal(vtile.layers.now.name, 'now', 'layer should have the same name');

        t.equal(vtile.layers.now.length, 128, 'layer should have the same number of features');

        var actualFeatures = {};
        var actualTypes = [];

        for (var i = 0; i < vtile.layers.now.length; i ++) {
          actualFeatures[JSON.stringify(vtile.layers.now.feature(i).loadGeometry())] = JSON.stringify(vtile.layers.now.feature(i).loadGeometry())
          actualTypes.push(vtile.layers.now.feature(i).type)
        }

        var expectedTypes = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

        var expectedFeatures = JSON.parse(fs.readFileSync('./test/fixtures/index-features-expected'));

        t.deepLooseEqual(actualFeatures, expectedFeatures, 'layer feature geometries should match');

        t.deepLooseEqual(actualTypes, expectedTypes, 'layer feature types should match');

        t.end();
      })
  });
});