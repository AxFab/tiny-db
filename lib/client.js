
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.ClientDb
  
  var fs = root.fs
  if( typeof fs === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      fs = require('fs')
    }
    else throw new Error('ClientDb requires fs');
  }


  var CollectionDb = root.CollectionDb
  if( typeof CollectionDb === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      CollectionDb = require('./collection.js')
    }
    else throw new Error('ClientDb requires CollectionDb');
  }

// ==========================================================================
// ClientDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var ClientDb = function (url) 
  {
    if (!(this instanceof ClientDb))
      return new ClientDb()

    this.__data = {}
  }

  // ------------------------------------------------------------------------
  ClientDb.prototype.collection = function (name) 
  {
    if (this.__data[name] == null)
      this.__data[name] = new CollectionDb(this, name)
    return this.__data[name]
  }

  // ------------------------------------------------------------------------
  ClientDb.prototype.close = function () 
  {
    this.__data = {}
  }


  // ------------------------------------------------------------------------
  /** Open a connection to a database. The url can be a distant server or a
    * local directory.
    */
  ClientDb.connect = function (url, callback) 
  {
    var db = new ClientDb(url)
    callback (null, db)
  }


// ==========================================================================
  ClientDb.noConflict = function () {
    root.ClientDb = previous_mod
    return ClientDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = ClientDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = ClientDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return ClientDb })
  else // Browser
    root.ClientDb = ClientDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
