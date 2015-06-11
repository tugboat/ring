var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/attrs');

describe('pw.attrs', function () {
  describe('initialize', function () {
    it('creates a pw_Attrs object with a single view');
    it('creates a pw_Attrs object with a collection');
  });
});

describe('pw_Attrs', function () {
  it('initializes with views');

  describe('findType', function () {
    it('finds type of hash');
    it('finds type of bool');
    it('finds type of mult');
    it('finds type of text');
  });

  describe('findValue', function () {
    it('finds value for class attr');
    it('finds value for style attr');
    it('finds value for bool attr');
    it('finds value for text attr');
  });

  describe('set', function () {
    it('sets the attr value for each view');
  });

  describe('ensure', function () {
    it('ensures value for class attr');
    it('ensures value for style attr');
    it('ensures value for bool attr');
    it('ensures value for text attr');
  });

  describe('deny', function () {
    it('denies value for class attr');
    it('denies value for style attr');
    it('denies value for bool attr');
    it('denies value for text attr');
  });
});
