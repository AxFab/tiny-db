
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.ShardDb


// ==========================================================================
// ShardDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var ShardDb = function (collection, option)
  {
    if (!(this instanceof ShardDb))
      return new ShardDb(db, option)

    this.__db = collection.__db
    this.__collection = collection
    this.__private = {
      name: this.__db.newuid(),
      serialized: false
    },
    this.__data = {
      boundaries: option.shardIndex || {},
      capacity: option.capacity || db.settings.shared.capacity || 300,
      documents: {},
      itemCount: 0,
    }

    this.id = this.__db.newuid()
    this.key = ''
  }


  // ------------------------------------------------------------------------
  /** Wraps count to return a count of the number of documents in a
    * collection or matching a query. */
  ShardDb.prototype.count = function (query)
  {
    if (!query)
      return this.__data.itemCount

    var sum = 0
    for (var k in this.__data.documents) {
      var doc = this.__data.documents[k]
      if (QueryDb.match(doc, query))
        ++sum
    }
    return sum
  }


  // ------------------------------------------------------------------------
  /** Returns an array of documents that have distinct values for the
    * specified field.
    * @param {field} The field for which to return distinct values.
    * @param {query} A query that specifies the documents from which to
    *                retrieve the distinct values.
    */
  ShardDb.prototype.distinct = function (field, query)
  {
    var fieldVector = {}
    for (var k in this.__data.documents) {
      var doc = this.__data.documents[k]
      if (!query || QueryDb.match(doc, query))
        if (!fieldVector[doc[field]])
          fieldVector[doc[field]] = doc
    }
    return fieldVector
  }


  // ------------------------------------------------------------------------
  /** Performs a query on a collection and returns a cursor object.
    * @param {query} Optional. Specifies query selection criteria using query
    *                operators.
    * @param {projection} Optional. Specifies the fields to return using
    *                     projection operators. Omit this parameter to return
    *                     all fields in the matching document.
    * @return A new shared holding the resulting documents.
    */
  ShardDb.prototype.find = function (query, projection)
  {
    var shard = new ShardDb(this.__db, {
      capacity: this__data.capacity,
    })

    for (var k in this.__data.documents) {
      var doc = this.__data.documents[k]
      if (!query || QueryDb.match(doc, query))
        if (projection)
          doc = QueryDb.remap(doc, projection)
        shard.insert (doc._id, doc)
    }

    return shard
  }


  // ------------------------------------------------------------------------
  /** Replace a document selected by its id and replace it by a new document
    */
  ShardDb.prototype.replace = function (id, document)
  {
    if (!this.__data.documents[id])
      return new Error("The document with id '"+id+"' can't be found on this shared.")

    // @todo update boundary-box
    this.__data.documents[id] = document
    this.__private.serialized = false
  }


  // ------------------------------------------------------------------------
  /** Deletes documents from a collection.
    * @param {query} Specifies deletion criteria using query operators.
    * @param {option.justOne} Optional. To limit the deletion to just one
    *                         document, set to true.
    * @param {option.writeConcern} Optional. A document expressing the write
    *                              concern. See Safe Writes.
    */
  ShardDb.prototype.remove = function (id)
  {
    if (!this.__data.documents[id])
      return new Error("The document with id '"+id+"' can't be found on this shared.")

    this.__data.documents[id] = null
    this.__private.serialized = false
    this.__data.itemCount--
    delete this.__data.documents[id]
  }


  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    */
  ShardDb.prototype.insert = function (id, document)
  {
    if (this.__data.documents[id])
      return new Error("The document with id '"+id+"' already exist on this shared.")
    if (this.__data.itemCount >= this.__data.capacity)
      return new Error("The current shared is already fulled")
    // @todo update boundary-box
    this.__data.documents[id] = document
    this.__data.itemCount++
    this.__private.serialized = false
  }


  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    */
  ShardDb.prototype.serialize = function ()
  {
    if (this.__private.serialized)
      return
    var self = this
    var key = this.__db.storage.save(this.__data, function (err, opt) {
      if (!err) {
        self.key = opt.key
        self.__collection.updateshard(self)
        self.__private.serialized = true
        return
      }

      console.error('Error in shard serialization: ' + key)
      // Set Timeout to retry !
    })
  }





// ==========================================================================
  ShardDb.noConflict = function () {
    root.ShardDb = previous_mod
    return ShardDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = ShardDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = ShardDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return ShardDb })
  else // Browser
    root.ShardDb = ShardDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
