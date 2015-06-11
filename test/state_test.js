var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/state');

describe('pw.state', function () {
  describe('build', function () {
    it('builds a representation of the state');
  });

  describe('buildForNode', function () {
    it('builds a representation of the node state');
  });

  describe('init', function () {
    it('returns a new pw_State');
  });
});

describe('pw_State', function () {
  describe('initialize', function () {
    it('sets the initial state');
    it('sets the current state');
    it('inits the diffs');
  });

  describe('diff', function () {
    it('captures and changes in the node state');
  });

  describe('update', function () {
    it('updates the current state with the diff');
  });

  describe('revert', function () {
    it('returns back to the initial state');
  });

  describe('rollback', function () {
    it('rolls back the diff by guid');
  });

  describe('elem', function () {
    it('returns the current state for a node')
  });
});
