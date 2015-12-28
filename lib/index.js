'use strict';

var path = require('path');
var walk = require('walk');
var is = require('is_js');

var debug = function () {};

var db = null;

var defaults = {
  prefix: 'static',
  separator: '.',
  basedir: null,
  id: 'slug'
};

var cache = {};

function statics(mongoose, config, done) {
  if (!mongoose) {
    throw new Error("The first argument must be your initialized Mongoose instance!");
  }

  db = mongoose;

  if (is.not.object(config)) {
    throw new Error("The config parameter must be an [Object]!");
  }

  /* Check debug type */
  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (config.debug) {
    debug = console.log;
  }

  if (is.not.string(config.basedir)) {
    throw new Error("The configuration's basedir property must be a valid path [String]!");
  }

  defaults.basedir = config.basedir;

  if (config.prefix) {
    if (is.not.string(config.prefix)) {
      throw new Error("The configuration's prefix property should be a [String]!");
    }

    defaults.prefix = config.prefix;
  }

  if (config.separator) {
    if (is.not.string(config.separator)) {
      throw new Error("The configuration's separator property should be a [String]!");
    }

    defaults.separator = config.separator;
  }

  if (config.id) {
    if (is.not.string(config.id)) {
      throw new Error("The configuration's id property should be a [String]!");
    }

    defaults.id = config.id;
  }

  var walker = walk.walk(defaults.basedir);

  walker.on('file', function (root, stats, next) {
    if (path.extname(stats.name) !== '.js') {
      return next();
    }

    var model = path.basename(stats.name, '.js');
    var Model = db.model(defaults.prefix + '.' + model);

    Model.find(function (err, results) {
      if (err) {
        debug("Could not retrieve %s.%s!", defaults.prefix, model);
        return next();
      }

      if (!results.length) {
        debug("There is no data for %s.%s!", defaults.prefix, model);
        return next();
      }

      cache[model] = {};

      results.forEach(function (result) {
        cache[model][result[defaults.id]] = result.toObject();

        debug("%s.%s.%s --> %s", defaults.prefix, model, result[defaults.id], result._id);
      });

      next();
    });
  });

  walker.on('error', function (root, stats) {
    debug("Could not register static!\n", root, stats);
  });

  walker.on('end', done);

}

statics.reload = function reload(done) {
  statics(db, defaults, done);
};

statics.get = function get(model, slug, everything) {
  if (model && slug) {
    if (cache[model] && cache[model][slug]) {
      if (everything) {
        return cache[model][slug];
      }

      return cache[model][slug]._id;
    }
  }

  if (model && !slug && cache[model]) {
    return cache[model];
  }

  if (!model && !slug && is.not.empty(cache)) {
    return cache;
  }

  return null;
};

module.exports = statics;
