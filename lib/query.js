
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.QueryDb
  

// ==========================================================================
// QueryDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var QueryDb = function (data, query, projection) 
  {
    if (!(this instanceof QueryDb))
      return new QueryDb(data, query, projection)

      this.__data = []
      for (var i=0; i<data.length; ++i) {
        var doc = data[i]
        if (QueryDb.match(doc, query)) 
          this.__data.push (doc)
      }
  }


  // ------------------------------------------------------------------------
  QueryDb.prototype.count = function (callback) 
  {
    callback(null, this.__data.length)
  }

  // ------------------------------------------------------------------------
  QueryDb.prototype.update = function (update, option, callback) 
  {
    var res = QueryDb.report()
    if (typeof option === 'function') {
      callback = option
      option = {}
    }

    for (var i=0; i<this.__data.length; ++i) {
      var doc = this.__data[i]

      for (var k in update) {
        if (k[0] == '$' && QueryDb.operations[k]) {
          QueryDb.operations[k] (doc, update[k])
          res.ops.push({})
        }
      }
    }

    callback(null, QueryDb.result(res))
  }

  // explain, hint, limit, next, skip, sort

  // ------------------------------------------------------------------------
  QueryDb.prototype.toArray = function (callback) 
  {
    callback(null, this.__data)
  }

  // ------------------------------------------------------------------------
  QueryDb.operations = {}

  QueryDb.operations.$set = function (argument) {
    try {
      for (var k in update) {
        if (typeof update[k] === 'object')
          DbExecute.inc(data[k], update[k])
        else
          data[k] = update[k]
      }
      return true
    } catch (e) {
      return false
    }
  }


  QueryDb.operations.$inc = function (argument) {
    try {
      for (var k in update) {
        if (typeof update[k] === 'object')
          DbExecute.inc(data[k], update[k])
        else
          data[k] += update[k]
      }
      return true
    } catch (e) {
      return false
    }
  }


  // ------------------------------------------------------------------------
  QueryDb.match = function (data, query)
  {
    if (query == null)
      return true;

    for (var k in query) {
      var valid
      if (typeof query[k] === 'object')
        valid = QueryDb.match(data[k], query[k])
      else
        valid = (data[k] == query[k])
      if (!valid)
        return false
    }

    return true;
  }

  // ------------------------------------------------------------------------
  QueryDb.report = function ()
  {
    return {
      ops: []
    }
  }

  // ------------------------------------------------------------------------
  QueryDb.result = function (report)
  {
    report.result = {
      n: report.ops.length
    }
    return report
  }


// ==========================================================================
  QueryDb.noConflict = function () {
    root.QueryDb = previous_mod
    return QueryDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = QueryDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = QueryDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return QueryDb })
  else // Browser
    root.QueryDb = QueryDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
