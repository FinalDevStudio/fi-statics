'use strict';

var path = require('path');
var walk = require('walk');
var is = require('is_js');

var debug = function () {};

var config = null;
var cache = [];

function statics(mongoose, cfg, done) {
  var walker = walk.walk(config.basedir);

  if (is.object(cfg)) {
    config = cfg;
  } else {
    done(new Error("The configuration parameter must be an [Object]!"));
  }

  /* Check debug type */
  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (config.debug) {
    debug = console.log;
  }

  walker.on('file', function (root, stats, next) {
    if (path.extname(stats.name) !== '.js') {
      return next();
    }

    var model = path.basename(stats.name, '.js');
    var Model = mongoose.model(config.prefix + '.' + model);

    Model.find(function (err, results) {
      if (err) {
        debug("Could not retrieve %s.%s!", config.prefix, model);
        return next();
      }

      if (!results.length) {
        debug("There is no data for %s.%s!", config.prefix, model);
        return next();
      }

      cache[model] = {};

      results.forEach(function (result) {
        cache[model][result.slug] = result;

        debug("%s.%s.%s --> %s", config.prefix, model, result.slug, result._id);
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
  return statics(config, done);
};

statics.get = function get(model, slug) {
  if (slug) {
    return cache[model][slug];
  }

  return cache[model];
};

module.exports = statics;
