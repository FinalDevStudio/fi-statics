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

var app = express();

var config: {
  debug = require('debug')('app:debug'),
  basedir: 'schemas/static',
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
- **basedir**: This is required and must be a `String`. This must be the absolute path to where the statics schemas are located in your application.
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
Ideally, the schemas for mongoose should be as follows:

```js
var schema = new Schema({

    slug: {
      type: String,
      required: true,
      unique: true
    }

  });

};
```

This will allows easy identification of the schema trough a _unique slug_ name, therefore being able to obtain the schema _id_ for model association through it.

### Getting data
Once initialized, this module will cache all your static data into memory. To obtain a static data you must call the `get` method with two optional arguments:

#### To obtain the whole cache object:
```js
var data = statics.get();
```

#### To obtain a whole model's data:
```js
var data = statics.get('model');
```

#### To obtain a static data by it's model and ID:
```js
var data =  statics.get('model', 'slug');
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

};
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

};
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

//...

app.post('/users', function (req, res, next) {

  var User = mongoose.model('user');

  User.create({
    name: req.body.name,
    email: req.body.email,
    role: statics.get('role', 'user')
  }, function (err, user) {
    //...
  });

});
```
