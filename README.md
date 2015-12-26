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

#### Example configuration

```js
{

  debug = require('debug')('app:statics'),

  basedir: path.join('schemas', 'static'),

  prefix: 'static'

}
```
