# mongo-store [![build status][1]][2]

Session store backed by mongodb

## Example

    var mongoStore = require("mongo-store")
        , assert = require("assert")
        , mongoCol = require("mongo-col")

    mongoCol("example-test-collection-mongo-store", function (collection) {
        var store = mongoStore(collection)
        store.set("foo", { "foo": "bar" }, function (err) {
            assert.equal(err, null)
            store.get("foo", function (err, value)  {
                assert.equal(err, null)
                assert.equal(value.foo, "bar")
                console.log("done")
            })
        })
    })

## Installation

`npm install mongo-store`

## Tests

`make test`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/mongo-store.png
  [2]: http://travis-ci.org/Raynos/mongo-store