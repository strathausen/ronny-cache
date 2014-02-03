var _      = require('underscore'),
    time   = require('english-time'),
    url    = require('url'),
    stores = require('./stores/Stores'),
    slice  = Array.prototype.slice,
    Ronny;

module.exports = Ronny = function RonnyCache(opts) {
  _.extends(opts, { maxAge: '10s' });
  var u, Store, store,
      db = url.parse(opts.db),
      maxAge = time(opts.maxAge);

  Store = stores[u.protocoll];
  if(Store) {
    this.store = new Store(db);
  } else {
    throw new Error 'RonnyCache store not supported: ' + u.protocoll;
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
        return cb(null, result);
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
      });
      fun.apply(null, args);
    });
  };
};
