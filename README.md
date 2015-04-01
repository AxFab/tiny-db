# Tiny DB

Tiny DB is a JSON document store database. 

The API is based on MongoDB, however it may not stay compatible forever.


## Getting started

The configuration is prety straitforward, this is one of the most important aspect of TinyDB:
Easy to install, easy to use.

The client will try to connect to the service using a single url parameter.
To start either choose null for an in-memory database or a local directory to use as storage.
For more option refer to the section named scalling service.


I will present here the most useful function that you need to
start using your new database.

### Connection


```
// Connection URL
var url = null; // Use in-memory database
// Use connect method to connect to db service
ClientDb.connect(url, function(err, db) {
  // ...
})
```


### Insertion

Inserts a document or documents into a collection.

The method take either a simple object or an array of object. 
The second argument can be an option object with some settings, and the last 
argument is a callback to call at the end of the query.

```
// Get the documents collection
var collection = db.collection('documents')
// Insert some documents
collection.insert([
    {a : 1}, {a : 2}, {a : 3}
  ], function (err, res) {
    // ...
  })
```

Options are:
  - `writeConcern` : See Safe Writes.
  - `ordered` : Should the items inserted in given order or in parralel.

### Update

```
// Get the documents collection
var collection = db.collection('documents')
// Insert some documents
collection.update(
  { a : 2 },
  { $set: { b : 1 } },
  function (err, res) {
    // ...
  })
```

### Delete

```
// Get the documents collection
var collection = db.collection('documents')
// Insert some documents
collection.update(
  { a : 3 },
  function (err, res) {
    // ...
  })
```

### Find

```
// Get the documents collection
var collection = db.collection('documents')
// Insert some documents
collection.find({}).toArray(function (err, docs) {
    // ...
  })
```

## Scalling service

 > Not implemented 


