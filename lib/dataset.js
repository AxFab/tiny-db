
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.DatasetDb


  var async = root.async
  if( typeof async === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      async = require('async')
    }
    else throw new Error('DatasetDb requires async');
  }

  var ShardDb = root.ShardDb
  if( typeof ShardDb === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      ShardDb = require('./shard.js')
    }
    else throw new Error('DatasetDb requires ShardDb');
  }


// ==========================================================================
// DatasetDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var DatasetDb = function (db, option)
  {
    if (!(this instanceof DatasetDb))
      return new DatasetDb(db, option)

    this.__db = db
    this.__private = {
      name: option.name,
      serialize: false
    }
    this.__data = {
    }

    this.serialize(function () {})
  }


  DatasetDb.prototype.serialize = function (callback)
  {
    if (this.__private.serialized)
      return
    var self = this


    var store = {
      name: this.__private.name,
      shards:[]
    }

    for (var k in this.__data) {
      var shard = this.__data[k]
      store.push({
        id: k,
        key: shard.key,
        boundary: shard.__data.boundaries
      })
    }

    var key = this.__db.storage.save(store, function (err, opt) {
      if (!err) {
        self.__private.key = opt.key
        self.__private.serialized = true
        return
      }

      console.error('Error in shard serialization: ' + key)
      // Set Timeout to retry !
    })
  }


  DatasetDb.prototype.newshard = function ()
  {
    var shard = new ShardDb(this, {
      capacity: 50
    })

    this.__data[shard.id] = shard
    return shard
  }

  // ------------------------------------------------------------------------

  DatasetDb.prototype.bestshard = function (documents, callback)
  {
    var idx = null
    for (var k in this.__data) {
      var shard = this.__data[k]
      idx = shard
    }

    if (!idx)
      return this.newshard()

    return idx
  }



  // ------------------------------------------------------------------------

  DatasetDb.prototype.updateshard = function (shard)
  {
    this.__private.serialize = false
  }


  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    */
  DatasetDb.prototype.find = function (query, callback) {
  }



  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    */
  DatasetDb.prototype.insert = function (documents, callback)
  {
    var res = { ops:[] }
    var self = this
    if (!(documents instanceof Array))
      documents = [ documents ]

    var shards = []
    async.each(documents, function (doc, callb1) {
      doc._id = self.__db.newuid()
      var shard = self.bestshard(doc)
      shards.push(shard)
      var sc = shard.insert(doc._id, doc)
      if (!sc)
        res.ops.push({ op:'PUT', id:doc._id })
      else
        res.ops.push({ id:doc._id, error:sc.message })
      callb1(sc)
    }, function (err) {
      if (err)
        return callback(err)
      async.each(shards, function (shard, callb2) {
        callb2(shard.serialize())
      }, function (err) {
        if (err)
          return callback(err)
        callback(null, res)
      })
    });
  }


  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    */
  DatasetDb.prototype.remove = function (query, callback) {
    var cursor = this.find(query)
    cursor.foreach (function (shared, doc) {
      return shared.remove(doc.id)
    }, callback)
  }



// ==========================================================================
  DatasetDb.noConflict = function () {
    root.DatasetDb = previous_mod
    return DatasetDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = DatasetDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = DatasetDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return DatasetDb })
  else // Browser
    root.DatasetDb = DatasetDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
