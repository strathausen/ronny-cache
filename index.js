var _ = require('underscore')
  , time = require('english-time')
  , url = require('url')
  , Ronny
  , slice = Array.prototype.slice;
  , stores = {
      redis: function RonnyRedis(cb) {
        var redis = require('redis'),
            client = redis.createClient(db.port, db.hostname, {
              no_ready_check: true
            });
        
        if(db.auth) {
          client.auth(redisURL.auth.split(":")[1]);
        }

        return {
          set: function(key, value, cb) {
            client.set(key, JSON.stringify(value), cb);
          },
          get: function(key, cb) {
            client.get(key, function(err, res) {
              if (err) {
                cb(err);
                return;
              }
              var result;
              try {
                result = JSON.parse(res);
              } catch(e) {
                return cb(e);
              }
              cb(null, result)
            });
          }
        }
      }
    }

module.exports = Ronny = function RonnyCache(opts) {
  var u, Store, store;
  _.extends(opts, { maxAge: '10s' });
  u = url.parse(opts.db);
  this.maxAge = time(opts.maxAge);
  Store = stores[u.protocoll];
  if(Store) {
    this.store = Store(u);
  }
}

Ronny.prototype.wrap = function RonnyWrap(fun) {
  // Transparently do not cache when no DB is provided
  if(!this.store) {
    return fun;
  }
  var self = this;
  return function RonnyWrapped() {
    var args = slice.call(arguments, 0, arguments.length - 1),
        cb   = arguments[arguments.length - 1],
        key  = JSON.stringify(args);

    self.store.get(key, function(err, result) {
      if (err) {
        cb(err);
        return;
      }
      // There is valid data, pass it on to the callback
      if(result && result.data && result.expires > Date.now()) {
        cb(null, result.data);
      // No cache hit or expired, calculate result
      } else {
        // TODO works but weird thing to do, make a copy of args instead...
        args.push(function() {
          // error argument and result arguments
          // function(err, results) ...
          var err = arguments[0], args;
          if (err) {
            cb(err);
            return;
          }
          args = slice.call(arguments, 1);
          self.store.set(key, {
            data: args,
            expires: (Date.now() + self.maxAge)
          });
        })
        fun.apply(null, args);
      }
    });
  }
}
