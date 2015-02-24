var fs = require('fs');
var tape = require('tape');
var split = require('split')();
var trizilla = require('../index')();

tape('should make 16 tile objects', function(t) {
  var out = fs.createWriteStream('test/fixtures/out.test');
  //var expected = fs.readFileSync('./test/fixtures/vectors');
  fs.createReadStream('./test/fixtures/tri-geojson-stream')
    .pipe(split)
    .pipe(trizilla.clean({}))
    .pipe(trizilla.tile(1))
    .pipe(out)
    .on('error', function() { t.ifError(err); })
    .on('finish', function() {
      var count = 0;
      var outfile = fs.createReadStream('test/fixtures/out.test');
      outfile.on('data', function(chunk) {
        for (i=0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
      })
      .on('end', function() {
        t.equals(count, 16, 'correct number of tiles')
      });
      t.end();
    });
});