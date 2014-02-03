var Cache = require('./');
cache = new Cache({
  db     : 'redis://',
  maxAge : 2000
});

var myFun = function(a, b, cb) {
  setTimeout(function() {
    cb(null, a, b * Math.random());
  }, 500);
};

var cachedFun = cache.wrap(myFun);

cachedFun({ q: 2 }, 1, function(err, result1, result2) {
  console.log('This takes longer the first time:', err, result1, result2);
});
