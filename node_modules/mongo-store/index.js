var partial = require("ap").partial
    , mongoSetOptions = {
        safe: true
        , upsert: true
    }
    , mongoDeleteOptions = {
        safe: true
    }
    , NOT_REMOVED_ERROR_MESSAGE = "MongoDB could not remove collection"
    , NOT_UPDATED_ERROR_MESSAGE = "MongoDB could not update collection"

module.exports = createMongoStore

function createMongoStore(collection) {
    return {
        _collection: collection
        , get: mongoGet
        , set: mongoSet
        , delete: mongoDelete
    }
}

function mongoGet(key, callback) {
    this._collection.findOne({
        key: key
    }, partial(returnData, callback))
}

function returnData(callback, err, value) {
    if (err) {
        return callback(err)
    }

    if (value === null) {
        return callback(null, null)
    }

    callback(null, value.data)
}

function mongoSet(key, value, callback) {
    this._collection.update({
        key: key
    }, {
        $set: {
            key: key
            , data: value
        }
    }, mongoSetOptions, partial(returnError, callback))
}

function returnError(callback, err, value) {
    if (err) {
        return callback(err)
    }

    if (value === 0) {
        return callback(new Error(NOT_UPDATED_ERROR_MESSAGE))
    }

    callback(null)
}

function mongoDelete(key, callback) {
    this._collection.remove({
        key: key
    }, mongoDeleteOptions, partial(errorIfNotRemoved, callback))
}

function errorIfNotRemoved(callback, err, value) {
    if (err) {
        return callback(err)
    }

    if (value === 0) {
        return callback(new Error(NOT_REMOVED_ERROR_MESSAGE))
    }

    callback(null)
}