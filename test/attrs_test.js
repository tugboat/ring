var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/view');
require('../src/core/attrs');

describe('pw.attrs', function () {
  describe('initialize', function () {
    it('creates a pw_Attrs object with a single view');
    it('creates a pw_Attrs object with a collection');
  });
});

describe('pw_Attrs', function () {
  var doc, node, view, attrs;
  beforeEach(function () {
    doc = helper.loadDoc('node.html');
    node = doc.getElementsByTagName('div')[0];
    view = pw.view.init(node);
    attrs = pw.attrs.init(view);
  });

  it('initializes with views');

  describe('findType', function () {
    it('finds type of hash', function () {
      expect(attrs.findType('style')).to.equal('hash');
    });

    it('finds type of bool', function () {
      expect(attrs.findType('disabled')).to.equal('bool');
    });

    it('finds type of mult', function () {
      expect(attrs.findType('class')).to.equal('mult');
    });

    it('finds type of text', function () {
      expect(attrs.findType('title')).to.equal('text');
    });
  });

  describe('findValue', function () {
    // can't test class until jsdom supports classList (or write a shim)
    it('finds value for class attr');

    it('finds value for style attr', function () {
      node.style.background = 'blue';
      expect(attrs.findValue(view, 'style')).to.equal(node.style);
    });

    it('finds value for bool attr', function () {
      node.setAttribute('disabled', 'disabled');
      expect(attrs.findValue(view, 'disabled')).to.equal(true);
    });

    it('finds value for text attr', function () {
      node.title = 'foo';
      expect(attrs.findValue(view, 'title')).to.equal('foo');
    });
  });

  describe('set', function () {
    it('sets the attr value for each view');
  });

  describe('ensure', function () {
    // can't test class until jsdom supports classList (or write a shim)
    it('ensures value for class attr');

    it('ensures value for style attr', function () {
      attrs.ensure('style', { background: 'blue' });
      expect(node.style.background).to.equal('blue');
    });

    it('ensures value for bool attr', function () {
      attrs.ensure('disabled');
      expect(node.getAttribute('disabled')).to.equal('disabled');
    });

    it('ensures value for text attr', function () {
      attrs.ensure('title', 'foo');
      expect(node.getAttribute('title')).to.equal('foo');
    });
  });

  describe('deny', function () {
    // can't test class until jsdom supports classList (or write a shim)
    it('denies value for class attr');

    it('denies value for style attr', function () {
      node.style.background = 'blue';
      attrs.deny('style', { background: 'blue' });
      expect(node.style.background).to.equal('');
    });

    it('denies value for bool attr', function () {
      node.setAttribute('disabled', 'disabled');
      attrs.deny('disabled');
      expect(node.getAttribute('disabled')).to.equal(null);
    });

    it('denies value for text attr', function () {
      node.setAttribute('title', 'foobar')
      attrs.deny('title', 'foo');
      expect(node.getAttribute('title')).to.equal('bar');
    });
  });
});
