var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/instruct');

describe('pw.instruct', function () {
  describe('process', function () {
    describe('and the collection is empty', function () {
      it('fetches the view');
    });

    describe('and the collection is not empty', function () {
      it('processes each instruction');
    });
  });

  describe('fetchView', function () {
    it('fetches the view with the socket');
    it('replaces the empty node with the fetched view');
    it('processes each instruction');
  });

  describe('perform', function () {
    describe('with a simple instruction', function () {
      it('performs the instruction');
    });

    describe('with a contextual instruction', function () {
      it('finds the context');
      it('performs nested instructions within the context');
    });

    describe('with a nested instruction', function () {
      it('performs the initial instruction');
      it('performs nested instructions on the result');
    });

    describe('with an attr instruction', function () {
      it('calls performAttr');
    });
  });

  describe('performAttr', function () {
    describe('when the attr has a value', function () {
      it('sets the attribute value');
    });

    describe('when the attr does not have a value', function () {
      it('calls the contextual method');
    });
  });
});
