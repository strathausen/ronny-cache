# ronny-cache - async function cacher

Do you sometimes have asynchroneous functions
that do slow things,
like
parsing files,
requesting APIs
or
doing 10 SQL queries with tons of JOINs in them?

Worry no more.

Ronny Cache is there to help.

## What it does.

`ronny-cache` is a node module that wraps asynchroneous functions
and caches their results in Redis or in-memory.

## How to use it.

Just wrap your slow function with `ronny`.

``` js
var Ronny = require('ronny-cache');
var ronny = new Ronny({
  /* db connection string, uses in-memory caching when empty */
  db: process.env.MONGO_OR_REDIS_URL
  /* optional */
, maxAge: '2s' // string that can be parsed by monent.js
});

/* the arguments have to be serialisable */
function mySlowApiFileParserQuery(a, b, c, callback) {
  # ... lots of slow stuff here ...
  callback(null, results);
}

var cachedFunction = ronny(mySlowApiFileParserQuery);
```
