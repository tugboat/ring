var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/init');
require('../src/core/component');

describe('pw.component', function () {
  describe('init', function () {
    it('returns a new pw_Component');
  });

  describe('findAndInit', function () {
    it('resets the channels');
    it('initializes each found component');
  });

  describe('push', function () {
    it('pushes the payload down each component registered for the channel');
  });

  describe('register', function () {
    it('registers a component fn by name');
  });

  describe('buildConfigObject', function () {
    it('returns the config object');
  });

  describe('registerForChannel', function () {
    it('registers the component to the channel');
  });
});
