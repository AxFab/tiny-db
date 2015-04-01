
(function () {

  var previous_mod, root = this
  if (root != null)
    previous_mod = root.StorageDb

  var fs = root.fs
  if( typeof fs === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      fs = require('fs')
    }
    else throw new Error('StorageDb requires fs');
  }

  var crypto = root.crypto
  if( typeof crypto === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      crypto = require('crypto')
    }
    else throw new Error('StorageDb requires crypto');
  }

  var zlib = root.zlib
  if( typeof zlib === 'undefined' ) {
    if( typeof require !== 'undefined' ) {
      zlib = require('zlib')
    }
    else throw new Error('StorageDb requires zlib');
  }


// ==========================================================================
// StorageDb
// ==========================================================================
  // ------------------------------------------------------------------------
  var StorageDb = function (url, options)
  {
    if (!(this instanceof StorageDb))
      return new StorageDb(url, options)

    // console.log ('StorageDb ', url)
    this.__data = {
      dirname: url + '/objs/',
      dirLevels: options.dirLevels || 0,
      digestAlgo: options.digestAlgo || 'sha1',
      compress: options.compress != null ? options.compress : true,
      zlib: options.zlib ||  {},
    }
  }


  // ------------------------------------------------------------------------
  StorageDb.prototype.getPath = function(digest, lvl)
  {
    if (!lvl)
      lvl = this.__data.dirLevels
    var dirs = []
    var path = this.__data.dirname + '/'
    for (var i=0; i <lvl; ++i) {
      path += digest.substring(0,2) + '/'
      dirs.push(path)
      digest = digest.substring(2)
    }

    return path + digest
  }


  // ------------------------------------------------------------------------
  StorageDb.prototype.save = function (data, callback)
  {
    if (!callback)
      callback = function(){}

    data = JSON.stringify(data)
    if (this.__data.compress == true)
      data = zlib.deflateSync(data, this.__data.zlib)

    var shasum = crypto.createHash(this.__data.digestAlgo)
    shasum.update(data)
    var digest = shasum.digest('hex');

    var path =  this.getPath(digest)
    fs.writeFile(path, data, function(err) {
      callback(err, { key:digest, data:data })
    })
    return digest
  }


  // ------------------------------------------------------------------------
  StorageDb.prototype.load = function (digest, callback)
  {
    if (!callback)
      callback = function(){}

    this.loadAt (digest, {
      lvl: this.__data.dirLevels,
      tryUp: false,
      sharding: false
    }, callback)
  }


  // ------------------------------------------------------------------------
  StorageDb.prototype.loadErr = function (err, digest, opt, callback)
  {
    if (err.code == 'ENOENT' || err.code == 'CORRUPTED') {
      if (opt.sharding) {

      } else if (opt.tryUp && opt.lvl > 0) {
        opt.lvl--
        return this.loadAt(digest, opt, callback)
      }
    }

    return callback (err)
  }


  // ------------------------------------------------------------------------
  StorageDb.prototype.loadAt = function (digest, opt, callback)
  {
    var self = this
    var path =  this.getPath(digest, opt.lvl)
    fs.readFile (path, function(err, data) {
      if (err)
        return self.loadErr(err, digest, opt, callback)

      var shasum = crypto.createHash(this.__data.digestAlgo)
      shasum.update(data)
      if (digest != shasum.digest('hex')) {
        err = new Error ('Invalid digest for ' + digest)
        err.code = 'CORRUPTED'
        return self.loadErr(err, digest, opt, callback)
      }

      if (this.__data.compress == true)
        data = zlib.inflateSync(data, this.__data.zlib)

      data = JSON.parse(data)
      callback (null, data)
    })
  }


// ==========================================================================
  StorageDb.noConflict = function () {
    root.StorageDb = previous_mod
    return StorageDb
  }

  if (typeof module !== 'undefined' && module.exports) // Node.js
    module.exports = StorageDb
  else if (typeof exports !== 'undefined')
    exports = module.exports = StorageDb
  else if (typeof define !== 'undefined' && define.amd) // AMD / RequireJS
    define([], function () { return StorageDb })
  else // Browser
    root.StorageDb = StorageDb

}).call(this)


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
