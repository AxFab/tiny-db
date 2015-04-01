
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.CollectionDb
  
  var fs = root.fs
  if( typeof fs === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      fs = require('fs')
    }
    else throw new Error('CollectionDb requires fs');
  }

  // var ExecuteDb = root.ExecuteDb
  // if( typeof ExecuteDb === 'undefined' ) {
  //   if( typeof require !== 'undefined' ) {
  //     ExecuteDb = require('./execute.js')
  //   }
  //   else throw new Error('CollectionDb requires ExecuteDb');
  // }

  var QueryDb = root.QueryDb
  if( typeof QueryDb === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      QueryDb = require('./query.js')
    }
    else throw new Error('CollectionDb requires QueryDb');
  }

// ==========================================================================
// CollectionDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var CollectionDb = function (client, name) 
  {
    if (!(this instanceof CollectionDb))
      return new CollectionDb(client, name)

    this.__client = client
    this.__name = name
    this.__data = []
  }


  // ------------------------------------------------------------------------
  /** Wraps count to return a count of the number of documents in a 
    * collection or matching a query. */
  CollectionDb.prototype.count = function (query, callback) 
  {
    this.find(query).count(callback)
  }


  // ------------------------------------------------------------------------
  /** Returns an array of documents that have distinct values for the 
    * specified field.
    * @param {field} The field for which to return distinct values.  
    * @param {query} A query that specifies the documents from which to 
    *                retrieve the distinct values.
    */
  CollectionDb.prototype.distinct = function (field, query, callback) 
  {
  }


  // ------------------------------------------------------------------------
  /** Performs a query on a collection and returns a cursor object.
    * @param {query} Optional. Specifies query selection criteria using query 
    *                operators.
    * @param {projection} Optional. Specifies the fields to return using 
    *                     projection operators. Omit this parameter to return
    *                     all fields in the matching document.
    * @return A cursor to the documents that match the query criteria.
    */
  CollectionDb.prototype.find = function (query, projection)
  {
    var result = new QueryDb(this.__data, query, projection);
    return result
  }


  // ------------------------------------------------------------------------
  /** Performs a query and returns a single document. 
    * @param {query} Optional. Specifies query selection criteria using query 
    *                operators.
    * @param {projection} Optional. Specifies the fields to return using 
    *                     projection operators. Omit this parameter to return
    *                     all fields in the matching document.
    * @return One document that satisfies the criteria.
    */
  CollectionDb.prototype.findOne = function (query, projection, callback)
  {
    var result = new QueryDb(this.__data, query, projection);
    result.findOne(callback)
  }


  // ------------------------------------------------------------------------
  /** Inserts a document or documents into a collection.
    * @param {documents} A document or array of documents to insert into the 
    *                    collection.
    * @param {option.writeConcern} Optional. A document expressing the write 
    *                              concern. See Safe Writes.
    * @param {option.ordered} Optional. If true, perform an ordered insert of 
    *                         the documents in the array.
    */
  CollectionDb.prototype.insert = function (data, option, callback)
  {
    var res = QueryDb.report()
    if (typeof option === 'function') {
      callback = option
      option = {}
    }

    for (var i=0; i<data.length; ++i) {
      this.__data.push (data[i]) // @todo clone
      res.ops.push({})
    }

    callback(null, QueryDb.result(res))
  }


  // ------------------------------------------------------------------------
  /** Deletes documents from a collection. 
    * @param {query} Specifies deletion criteria using query operators.
    * @param {option.justOne} Optional. To limit the deletion to just one 
    *                         document, set to true. 
    * @param {option.writeConcern} Optional. A document expressing the write 
    *                              concern. See Safe Writes.
    */
  CollectionDb.prototype.remove = function (query, option, callback) 
  {
    var res = QueryDb.report()
    if (typeof option === 'function') {
      callback = option
      option = {}
    }
    
    for (var i=0; i<this.__data.length; ++i) {
      var doc = this.__data[i]
      if (doc.a == query.a) {
        this.__data.splice(i, 1)
        res.ops.push({})
      }
    }

    callback(null, QueryDb.result(res))
  }


  // ------------------------------------------------------------------------
  /** Modifies a document in a collection.
    * @param {query} Specifies update criteria using query operators.
    * @param {update} The modifications to apply. For details see Update 
    *                 Parameter.
    * @param {option.upsert} Optional. If set to true, creates a new document
    *                        when no document matches the query criteria.
    * @param {option.multi} Optional. If set to true, updates multiple 
    *                       documents that meet the query criteria.
    * @param {option.writeConcern} Optional. A document expressing the write 
    *                              concern. See Safe Writes.
    */
  CollectionDb.prototype.update = function (query, update, option, callback) 
  {
    var result = new QueryDb(this.__data, query);
    result.update(update, option, callback)
  }


// ==========================================================================
  CollectionDb.noConflict = function () {
    root.CollectionDb = previous_mod
    return CollectionDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = CollectionDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = CollectionDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return CollectionDb })
  else // Browser
    root.CollectionDb = CollectionDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
