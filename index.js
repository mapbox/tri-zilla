var aggregator = require('./lib/aggregator');
var inflater = require('./lib/inflater');

function eatStream(line) {
  try {
    var data = JSON.parse(line);
    aggregator.dataEater(data.key, data.attributes, 3, streamOut);
  } catch(err) { }
}

function streamOut(err, GeoJSON) {
    console.log(JSON.stringify(GeoJSON));
};

module.exports = {
    eatStream: eatStream,
    holder: aggregator.holder
}