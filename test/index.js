'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var statics = require('../lib');
var uuid = require('node-uuid');
var path = require('path');

describe('Fi Statics', function () {

  before(function (done) {

    mongoose.connect('mongodb://localhost:27017/fi-statics-tests-' + uuid.v4());

    mongoose.connection.once('open', function () {
      var basedir = path.normalize(path.join(__dirname, 'schemas', 'static'));

      mongoose.model('static.gender', require(basedir + '/gender')(mongoose.Schema));
      mongoose.model('static.role', require(basedir + '/role')(mongoose.Schema));

      mongoose.model('static.gender').create([{
        slug: 'male'
      }, {
        slug: 'female'
      }], function (err) {
        if (err) {
          done(err);
        }
      });

      mongoose.model('static.role').create([{
        name: 'User',
        slug: 'user'
      }, {
        name: 'Administrator',
        slug: 'admin'
      }], function (err) {
        if (err) {
          done(err);
        }
      });

      statics(mongoose, {
        basedir: basedir,
        debug: true
      }, done);
    });

    mongoose.connection.on('error', done);

  });

  it('object should be a function', function () {
    expect(statics).to.be.a('function');
  });

  it('should retrieve all cached models', function () {
    var data = statics.get();

    expect(data).to.be.an('object');
    expect(data.gender).to.be.an('object');
    expect(data.gender.male).to.be.an('object');
    expect(data.gender.female).to.be.an('object');
    expect(data.role).to.be.an('object');
    expect(data.role.admin).to.be.an('object');
    expect(data.role.user).to.be.an('object');
  });

  it('should retrieve a model\'s data', function () {
    var data = statics.get('role');

    expect(data).to.be.an('object');
    expect(data.admin).to.be.an('object');
    expect(data.user).to.be.an('object');
  });

  it('should retrieve a single static ObjectID', function () {
    var data = statics.get('role', 'admin');

    expect(data).to.be.an('object');
    expect(mongoose.Types.ObjectId.isValid(data.toString())).to.be.true;
  });

  it('should retrieve a single static data', function () {
    var data = statics.get('role', 'admin', true);

    expect(data).to.be.an('object');
    expect(data.slug).to.be.a('string');
    expect(data.name).to.be.a('string');
    expect(data._id).to.be.an('object');
  });

  it('should reload statics contents', function (done) {

    mongoose.model('static.role').create({
      name: 'Moderator',
      slug: 'mod'
    }, function (err) {
      if (err) {
        done(err);
      }

      statics.reload(function () {
        var data = statics.get('role', 'mod');

        expect(data).to.be.an('object');

        done();
      });
    });

  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(function (err, result) {
      done(err);
    });
  });

});
