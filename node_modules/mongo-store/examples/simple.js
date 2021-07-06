var createStore = require("..")
    , assert = require("assert")
    , mongoCol = require("mongo-col")

mongoCol("example-test-collection-mongo-store", function (collection) {
    var store = createStore(collection)
    store.set("foo", { "foo": "bar" }, function (err) {
        assert.equal(err, null)
        store.get("foo", function (err, value)  {
            assert.equal(err, null)
            assert.equal(value.foo, "bar")
            console.log("done")
        })
    })
})