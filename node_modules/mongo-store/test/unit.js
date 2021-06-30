var Store = require("..")
    , test = require("testling")
    , sinon = require("sinon")
    , cc = require("composite").cc

test("setting values calls update", cc(function (err) {
    var t = this.t

    t.equal(err, null, "error is not null")
    t.ok(this.update.calledOnce, "update was not called")
    t.ok(this.update.calledWith({
        key: "foo"
    }, {
        $set: {
            key: "foo"
            , data: this.value
        }
    }, {
        safe: true
        , upsert: true
    }, sinon.match.func), "update not called correctly")

    t.end()
}, function (cb) {
    this.update.yields(null, 1)

    this.store.set("foo", this.value, cb)
}, setUp))

test("setting value fails if mongodb errors", cc(function (err)  {
    var t = this.t

    t.equal(err, this.error, "error is not propagated")

    t.end()
}, function (cb) {
    this.update.yields(this.error)

    this.store.set("foo", this.value, cb)
}, setUp))

test("getting value calls findOne", cc(function (err, result) {
    var t = this.t

    t.equal(err, null, "error is not null")
    t.equal(result, this.value, "result is not the value")
    t.ok(this.findOne.calledOnce, "findOne was not called once")
    t.ok(this.findOne.calledWith({
        key: "foo"
    }, sinon.match.func), "findOne is called incorrectly")

    t.end()
}, function (cb) {
    this.findOne.yields(null, {
        data: this.value
    })

    this.store.get("foo", cb)
}, setUp))

test("getting value handles no documents updated", cc(function (err) {
    var t = this.t

    t.equal(err.message, "MongoDB could not update collection")

    t.end()
}, function (cb) {
    this.update.yields(null, 0)

    this.store.set("foo", this.value, cb)
}, setUp))

test("getting value propagates database errors", cc(function (err, result) {
    var t = this.t

    t.equal(err, this.error, "error is not propagated")

    t.end()
}, function (cb) {
    this.findOne.yields(this.error)

    this.store.get("foo", cb)
}, setUp))

test("deleting value calls remove", cc(function (err) {
    var t = this.t

    t.equal(err, null, "error is not null")
    t.ok(this.remove.calledOnce, "remove was not called")
    t.ok(this.remove.calledWith({
        key: "foo"
    }, {
        safe: true
    }, sinon.match.func), "remove was not called correctly")

    t.end()
}, function (cb) {
    this.remove.yields(null, 1)

    this.store.delete("foo", cb)
}, setUp))

test("deleting value handles no documents removed", cc(function (err) {
    var t = this.t

    t.equal(err.message, "MongoDB could not remove collection")

    t.end()
}, function (cb) {
    this.remove.yields(null, 0)

    this.store.delete("foo", cb)
}, setUp))

test("deleting propagates database errors", cc(function (err) {
    var t = this.t

    t.equal(err, this.error, "database error not propagated")

    t.end()
}, function (cb) {
    this.remove.yields(this.error)

    this.store.delete("foo", cb)
}, setUp))

function setUp(t, cb) {
    var collection = this.collection = createCollection()
    this.t = t
    this.update = collection.update
    this.value = {}
    this.error = {}
    this.findOne = collection.findOne
    this.remove = collection.remove
    this.store = createStore(collection)

    cb()
}

function createStore(collection) {
    return Store(collection)
}

function createCollection() {
    return {
        update: sinon.stub()
        , findOne: sinon.stub()
        , remove: sinon.stub()
    }
}