var _      = require('underscore'),
    time   = require('english-time'),
    url    = require('url'),
    stores = require('./stores/Stores'),
    Promise= require('bluebird'),
    slice  = Array.prototype.slice,
    Ronny;

module.exports = Ronny = function RonnyCache(opts) {
  _.extend({ maxAge: '10s' }, opts);
  var Store, store,
      // TODO check if opts.db already is an object
      u = url.parse(opts.db);
  opts.db = u;

  opts.maxAge = time(opts.maxAge);

  this.prefix = opts.prefix || '';

  Store = stores[u.protocol.replace(/:$/, '')];
  if(Store) {
    this.store = new Store(opts);
  } else {
    throw new Error('RonnyCache store not supported: ' + u.protocoll);
  }
};

Ronny.prototype.wrap = function RonnyWrap(fun) {
  var self = this;
  return new Promise(resolve, reject) {
    var args = slice.call(arguments, 0, arguments.length - 1),
        cb   = arguments[arguments.length - 1],
        key  = self.prefix + ':' + JSON.stringify(args);

    self.store.get(key, function(err, result) {
      if(err) {
        return ;
      }
      
      // Cache hit
      if(result) {
        return cb.apply(null, [ null ].concat(result));
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
        cb.apply(null,  [ null ].concat(result));
      });
      fun.apply(null, args);
    });
  };
};
