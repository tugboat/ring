var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/view');

describe('pw.view', function () {
  describe('init', function () {
    it('returns a pw_View the node');
  });

  describe('applyState', function () {
    it('applies the state to the view');
  });

  describe('clone', function () {
    it('clones the new');
  });

  describe('remove', function () {
    it('removes the view');
  });

  describe('clear', function () {
    it('clears the view');
  });

  describe('title', function () {
    it('sets the title');
  });

  describe('text', function () {
    it('sets the text');
  });

  describe('html', function () {
    it('sets the html');
  });

  describe('append', function () {
    it('appends the view');
  });

  describe('prepend', function () {
    it('prepends the view');
  });

  describe('after', function () {
    it('inserts the view after');
  });

  describe('before', function () {
    it('inserts the view before');
  });

  describe('replace', function () {
    it('replaces the view');
  });

  describe('attrs', function () {
    it('returns a new attrs object');
  });

  describe('scope', function () {
    it('returns the view with the scope');
  });

  describe('prop', function () {
    it('returns the view with the prop');
  });

  describe('component', function () {
    it('returns the view with the component');
  });

  describe('with', function () {
    it('calls the fn in context of the collection');
  });

  describe('match', function () {
    it('matches the views to the data');
  });

  describe('for', function () {
    it('calls the fn with each view and datum');
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
