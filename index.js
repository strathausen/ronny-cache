var _      = require('underscore'),
    time   = require('english-time'),
    url    = require('url'),
    stores = require('./stores/Stores'),
    slice  = Array.prototype.slice,
    Ronny;

var eyes = require('eyes');

module.exports = Ronny = function RonnyCache(opts) {
  _.extend(opts, { maxAge: '10s' });
  var Store, store,
      u = url.parse(opts.db);

  opts.maxAge = time(opts.maxAge);

  Store = stores[u.protocol.replace(/:$/, '')];
  if(Store) {
    this.store = new Store(opts);
  } else {
    throw new Error('RonnyCache store not supported: ' + u.protocoll);
  }
};

Ronny.prototype.wrap = function RonnyWrap(fun) {
  var self = this;
  return function RonnyWrapped() {
    var args = slice.call(arguments, 0, arguments.length - 1),
        cb   = arguments[arguments.length - 1],
        key  = JSON.stringify(args);

    self.store.get(key, function(err, result) {
      if(err) {
        return cb(err);
      }
      
      // Cache hit
      if(result) {
        return cb.apply(null, result);
      }

      args.push(function() {
        // error argument and result arguments
        // function(err, results) ...
        var err = arguments[0], result;
        if (err) {
          return cb(err);
        }
        result = slice.call(arguments, 1);
        self.store.set(key, result);
        cb.apply(null, result);
      });
      fun.apply(null, args);
    });
  };
};
