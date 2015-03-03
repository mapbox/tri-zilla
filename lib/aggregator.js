// The aggregator - for each attribute, sums attrs, and when 4 are reached,
// it outputs each / 4 (== average), and sends these + the id to kill the object

var Aggregator = function() {};

Aggregator.prototype = {
  aggregate: function(vals) {
    this.count++;
    for (var i in vals) {
      if (vals[i] > -999) {
        this.attrs[i].push(vals[i]);
      }
    }
    if (this.count === 4) {
      this.outputVals();
    }
  },
  initialize: function(qt, vals, callback) {
    this.callback = callback;
    this.qt = qt;
    this.attrs = {};
    for (var i in vals) {
      this.attrs[i] = [vals[i]]
    }
  },
  outputVals: function(format) {
    for (var i in this.attrs) {
      var sum = 0;
      for (var c = 0; c < this.attrs[i].length; c++) {
        sum += this.attrs[i][c];
      }
      this.attrs[i] = sum / this.attrs[i].length;
    }

    return this.callback(null, this.attrs, this.qt);
  },
  count: 1
};

// Get a parent and aggregate it, then stream it
module.exports = Aggregator;
