
var assert = require('assert'),
    DatasetDb = require('./lib/dataset.js'),
    StorageDb = require('./lib/storage.js')


var db = { storage: new StorageDb('./db/', { compress:false} ) }

var idAuto = 1564
db.newuid = function () {
  return '_Z' + (idAuto++)
}

var data = DatasetDb(db, {
  name: 'users',
  capacity: 50,
})


data.insert ( { login:'fabien', value:843 }, function(err, res) {
  console.log ('M', res)
})

data.insert ( [
  { login:'anne', value:732 },
  { login:'emma', value:379 },
  ], function(err, res) {
  console.log ('F', res)
})



