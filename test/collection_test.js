var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/collection');

describe('pw.collection', function () {
  describe('init', function () {
    it('returns a pw_Collection with views and selector');
  });

  describe('fromNodes', function () {
    it('returns a pw_Collection with views and a selector');
  });
});

describe('pw_Collection', function () {
  describe('initialize', function () {
    it('initializes with views and selector');
  });

  describe('find', function () {
    it('returns a collection with found nodes');
  });

  describe('removeView', function () {
    it('removes the view');
  });

  describe('addView', function () {
    it('adds the view');
  });

  describe('order', function () {
    it('reorders the views by id');
  });

  describe('length', function () {
    it('returns the view count');
  });

  // pakyow api

  describe('append', function () {
    it('calls append on the last view');
    it('adds the appended view to the collection');
  });

  describe('prepend', function () {
    it('calls prepend on the last view');
    it('adds the prepended view to the collection');
  });

  describe('scope', function () {
    it('returns a collection with found scopes');
  });

  describe('prop', function () {
    it('returns a collection with found props');
  });

  describe('component', function () {
    it('returns a collection with found components');
  });

  describe('with', function () {
    it('calls the fn in context of the collection');
  });

  describe('for', function () {
    it('calls the fn with each view and datum');
  });

  describe('match', function () {
    it('matches the views to the data');
  });

  describe('repeat', function () {
    it('matches the views to the data');
    it('calls the fn with each view and datum');
  });

  describe('bind', function () {
    it('binds each datum to each view');

    describe('with a fn', function () {
      it('calls the fn with each bound view and datum');
    });
  });

  describe('apply', function () {
    it('matches the views to the data');
    it('binds the data to the matched views');
    it('orders the matched views to the data');
  });
});
