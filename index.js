var util = require('util');
var Transform = require('stream').Transform;
var Aggregator = require('./lib/aggregator');
var inflator = require('./lib/inflator').inflate;
//var tiler = require('./lib/tiler');

module.exports = function() {
  var parentHolder = {}

  util.inherits(InflateStream, Transform);
  function InflateStream(minZ) { Transform.call(this, minZ); this.minZ = minZ; }
  // consume stream, inflate ∆s, and make parents
  InflateStream.prototype._transform = function(chunk, enc, callback) {
    var inflateStream = this;
    try { var data = JSON.parse(chunk); }
    catch(err) { callback(err); }

    inflateStream.push(inflator(data));
    minZ = inflateStream.minZ || (data.key.length-1)/2;
    if ((data.key.length-1)/2 > minZ) {
      var parent = data.key.substring(0, data.key.length-2);
      // Does the parent object already exist? if so, aggregate its values; if not, initialize one
      if (parentHolder[parent]) {
        parentHolder[parent].aggregate(data.attributes);
      } else {
        parentHolder[parent] = new Aggregator();
        parentHolder[parent].initialize(parent, data.attributes, function(err, child, pID) {
          if (err) throw err;
          inflateStream.push(inflator({ "key": parent, "attributes": child }));
          parentHolder[pID] = {}
        });
      }
    }
    callback();
  }
  return {
    inflate: function(value) { return new InflateStream(value); }
    //tile: function() { return new TileStream(); }
  }
}
