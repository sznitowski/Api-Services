var test = require("testling")
    , createStore = require("..")
    , mongoCol = require("mongo-col")
    , cc = require("composite").cc

test("can store values in the store", cc(function (err, result) {
    var t = this.t
        , collection = this.collection

    t.equal(err, null, "error is not null")
    t.notEqual(result, null, "result is null")
    t.equal(this.value.foo, result && result.foo,
        "value / result are not equal")

    t.end()
}, function (err, cb) {
    this.t.equal(err, null, "error is not null")
    this.store.get("key", cb)
}, function (cb) {
    this.store.set("key", this.value, cb)
}, tearDown, setUp))

test("returns null for non-existant values", cc(function (err, result) {
    var t = this.t

    t.equal(null, err, "error is not null")
    t.equal(null, result, "result is not null")

    t.end()
}, function (cb) {
    this.store.get("key", cb)
}, tearDown, setUp))

test("returns null after value is deleted", cc(function (err, result) {
    var t = this.t

    t.equal(err, null, "err is not null")
    t.equal(result, null, "result is not null")

    t.end()
}, function (err, cb) {
    this.store.get("key", cb)
}, function (err, cb) {
    this.store.delete("key", cb)
}, function (err, cb) {
    this.store.set("key", { foo: "bar" }, cb)
}, tearDown, setUp))

function setUp(t, cb) {
    var collection = this.collection = mongoCol("mongo-store-test")
    collection.drop(call(cb))
    this.t = t
    this.store = createStore(collection)
    this.value = {
        "foo": "bar"
    }
}

function tearDown(cb) {
    var db = this.collection.collection.db

    this.t.on("end", function () {
        db.close()
    })

    cb()
}

function call(f) {
    return caller

    function caller() {
        console.error("mongocol is ready")
        f()
    }
}