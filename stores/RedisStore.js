var RonnyRedis = function RonnyRedis(opts) {
  var redis = require('redis'),
      db = opts.db;
  this.client = redis.createClient(db.port, db.hostname, {
    no_ready_check: true
  });
  
  this.maxAge = opts.maxAge;

  if(db.auth) {
    client.auth(redisURL.auth.split(":")[1]);
  }
};

RonnyRedis.prototype.set = function RonnyRedisSetter(key, value, cb) {
  this.client.psetex(key, this.maxAge, JSON.stringify(value), cb);
};

RonnyRedis.prototype.get = function RonnyRedisGetter(key, cb) {
  this.client.get(key, function(err, res) {
    if (err) {
      return cb(err);
    }
    var result;
    try {
      result = JSON.parse(res);
    } catch(e) {
      return cb(e);
    }
    cb(null, result)
  });
};

module.exports = RonnyRedis;
