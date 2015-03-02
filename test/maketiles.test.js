var trizilla_tilemaker = require('../lib/maketile');
var fs = require('fs');
var tape = require('tape');
var Protobuf = require('pbf');
var VectorTile = require('vector-tile');
var zlib = require('zlib');

function tileTester(err, data) {
  if (err) throw (err);
  var tile = JSON.parse(data);

  zlib.gunzip(tile.buffer, function(err, data) {
    var pbf = new Protobuf(data);
    var vtile = new VectorTile.VectorTile(pbf);
    console.log(vtile);
  });
}

fs.readFile('./test/fixtures/laytile-expected', function(err, data) {
  if (err) throw (err);
  trizilla_tilemaker.makeTile(JSON.parse(data), tileTester);
})
