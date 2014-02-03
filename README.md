# ronny-cache - async function cacher

Do you sometimes have asynchronous functions
that do slow things,
like
parsing files,
requesting APIs
or
doing 10 SQL queries with tons of JOINs in them?

Worry no more.

Ronny Cache is there to help.

## What it does.

`ronny-cache` is a node module that wraps asynchronous functions
and caches their results in Redis.

## How to use it.

Just wrap your slow function with `ronny`.

``` js
var Ronny = require('ronny-cache');
var ronny = new Ronny({
  /* db connection string, uses in-memory caching when empty */
  db: process.env.REDIS_URL
  /* optional */
, maxAge: '2s' // string that can be parsed by monent.js
});

/* the arguments have to be serialisable via JSON.stringify */
function mySlowApiFileParserQuery(a, b, c, callback) {
  // ... lots of slow stuff here ...
  callback(null, results);
}

var cachedFunction = ronny.wrap(mySlowApiFileParserQuery);
```

## TODO

- support promises to be cached (pull-requests welcome)
- more kinds of stores (like MongoDB, or in-memory)
