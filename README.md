# Fi Statics
Static database content manager for Mongoose.

## Installing

```sh
npm install --save fi-statics
```

## Usage

```js
var statics = require('fi-statics');
```

### Initialization
You must call it with your Mongoose instance, to be able to load the data, a configuration `Object` and a callback:

```js
var statics = require('fi-statics');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');

var app = express();

var config: {
  basedir: path.join('schemas', 'static'),
  debug: require('debug')('app:debug'),
  prefix: 'static'
};

mongoose.connect('mongodb://localhost/example');

statics(mongoose, config, function () {
  app.listen();
});

//...
```

### Configuration
The configuration `Object` must have an authorizer function and a route array. The `debug` parameter is optional but recommended.
- **debug**: This option can be a `Function` to log with or a `Boolean`. If `true` it'll use `console.log`.
- **basedir**: This is required and must be a `String`. This must be the absolute path to where the static schemas are located.
- **prefix**: This is required and must be a `String`. This must be the prefix for the database statics.
- **id**: The name of the field to address the static. It's intended to be used with a _unique slug_ for easy identification.

#### Example configuration

```js
{

  debug = require('debug')('app:statics'),

  basedir: path.join('schemas', 'static'),

  prefix: 'static'

}
```

### Static schemas
The static schemas must be as follows:

```js
module.exports = function (Schema) {

  return new Schema({

    slug: {
      type: String,
      required: true,
      unique: true
    }

  });

};
```

The Schema parameter will be `mongoose.Schema`.

This will allows easy identification of the schema trough a _unique slug_ name, therefore being able to obtain the schema _id_ for model association through it.

### Getting data
Once initialized, this module will cache all your static data into memory. To obtain a static data you must call the `get` method with two optional arguments:

#### To obtain the whole cache object:

```js
var data = statics.get();
```

This will return an `Object` with the data sorted in hierarchy:

```js
{
  role: {
    admin: {
      _id: '55a67dd3b44aae032d000000',
      name: 'Administrator',
      slug: 'admin',
      __v: 0
    },

    user: {
      _id: '55a67dd3b44aae032d000001',
      name: 'User',
      slug: 'user',
      __v: 0
    },

    //...
  },

  gender: {
    //...
  }
}
```


#### To obtain a whole model's data:
```js
var data = statics.get('role');
```

This will retrieve the model's data only:
```js
{
  admin: {
    _id: '55a67dd3b44aae032d000000',
    name: 'Administrator',
    slug: 'admin',
    __v: 0
  },

  user: {
    _id: '55a67dd3b44aae032d000001',
    name: 'User',
    slug: 'user',
    __v: 0
  }
}
```

It is particularly useful for API methods:

```js
app.get('/statics', function (req, res, next) {

  /** Assuming 'req.query.static' is a valid static model name */
  res.send(statics.get(req.query.static));

});
```

#### To obtain a static's ObjectID by it's model and ID:

```js
var data =  statics.get('role', 'user');
```

In this case, a third argument set to `true` will return all the model data like a `mongoose.find`.

```js
var data =  statics.get('model', 'slug', true);
```

### Reloading data
If you add or modify a static in the database you must reload the cache.

### Example
The following example will demonstrate how to manage an application's user roles.

#### Static roles schema:

```js
var schema = new Schema({

  slug: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  permissions: [String]

});
```

#### Users schema:

```js
var schema = new Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: Schema.Types.ObjectID,
    ref: 'static.role'
  }

});
```

#### Database static data:
MongoDB collection `static.roles`:

```bson
/* 1 */
{
    "_id" : ObjectId("55a67dd3b44aae032d000000"),
    "name" : "Administrator",
    "slug" : "admin",
    "__v" : 0
}

/* 2 */
{
    "_id" : ObjectId("55a67dd3b44aae032d000001"),
    "name" : "Manager",
    "slug" : "manager",
    "__v" : 0
}

/* 3 */
{
    "_id" : ObjectId("55a67dd3b44aae032d000002"),
    "name" : "User",
    "slug" : "user",
    "__v" : 0
}
```

#### Creating a user with a role:

```js
var statics = require('fi-statics');
var mongoose = require('mongoose');
var express = require('express');

var app = express();

var config = {
  basedir: path.join('server', 'schemas', 'static')
};

statics(config, function () {

  /* Load statics before anything that might use them */

  //...

  app.post('/users', function (req, res, next) {

    var User = mongoose.model('user');

    User.create({
      /* Here we obtain the role static's ID to be able to create the 'ref' */
      role: statics.get('role', 'user'),
      email: req.body.email,
      name: req.body.name
    }, function (err, user) {
      //...
    });

  });

  app.listen();

});
```

As you may think, this can also be achieved with a `mongoose.find` but that will make an additional request to the database and clutter our code. Instead, **Fi Statics** caches the data is if it where a `mongoose.find` thus allowing you to obtain the data instantly and with little code.
