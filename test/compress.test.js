var split = require('split')();
var trizilla = require('../index')();
var fs = require('fs');
var tape = require('tape');

var all = []
tape('should compress a stream', function(t) {
  fs.createReadStream('./test/fixtures/fill-facets-output')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.compress(2))
    .on('data', function(data) {
      all.push(JSON.parse(data));
  }).on('end', function(td) {
    t.ok(trizilla, 'stream compressed, checking')
    var expected = fs.readFileSync('./test/fixtures/compressed-expected').toString();
    var data = JSON.stringify(all);
    t.equal(data, expected);
    t.end();
  });
});