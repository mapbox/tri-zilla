var Compressor = function() {};

Compressor.prototype = {
  aggregate: function(obj) {
    this.count++;
    this.sQt.push(obj.qt.slice(obj.qt.length - this.levels * 2, obj.qt.length));
    for (var v in this.fields) {
      if (v in obj.attributes) {
        this.fields[v].push(obj.attributes[v].toFixed(this.featRounding));
      } else {
        this.fields[v].push(null);
      }
    }
    if (this.count === this.totals) {
      this.outputVals()
    }
  },
  initialize: function(obj, levels, featRounding, callback) {
    this.levels = levels;
    this.fields = {};
    this.callback = callback;
    this.featRounding = featRounding;
    this.qt = obj.qt.slice(0, obj.qt.length - levels * 2);
    this.sQt = [obj.qt.slice(obj.qt.length - levels * 2, obj.qt.length)]
    for (var v in obj.attributes) {
      this.fields[v] = [obj.attributes[v].toFixed(featRounding)];
    }
    this.count = 1;
    this.totals = Math.pow(4, levels); 
  },
  outputVals: function() {
    var output = {
      qt: this.qt,
      sQts: this.sQt
    }
    for (var v in this.fields) {
      output[v] = this.fields[v];
    }
    return this.callback(null, output, this.qt);
  },
  sQt: []
};

var Decompressor = function() {
};

Decompressor.prototype = {
  decompress: function(data, callback) {
    var out = data.sQts.map(function(d, i) {
      return {
        qt: data.qt + d,
        attributes: {}
      }
    });

    delete data.qt;
    delete data.sQts;

    for (var f in data) {
      for (var i = 0; i < data[f].length; i++) {
        out[i].attributes[f] = data[f][i];
      }
    }
    return callback(null, out)
  }
}

var StreamCompressor = function(levels) {
  this.levels = levels;
  this.compressed = {};
  return this;
}

function flush () {
  if (!tiler) {
    throw Error('The tiler must be initialized first: tilemaker.initTiler(<zoomDelta, callback)');
  }
  for (var i in CompressStream.compressed) {
      CompressStream.compressed[i].flushFeatures();
  }
}

module.exports.Compressor = Compressor;
module.exports.Decompressor = Decompressor;

module.exports.StreamCompressor = StreamCompressor;
module.exports.flush = flush;




