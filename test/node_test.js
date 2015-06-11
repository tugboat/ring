var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/node');

describe('pw.node', function () {
  var doc, node;
  beforeEach(function () {
    doc = helper.loadDoc('node.html');
    node = doc.getElementsByTagName('div')[0];
  });

  describe('value', function () {
    describe('when node is a checkbox', function () {
      it('returns true when checked');
      it('returns false when unchecked');
    });

    describe('when node is a text input', function () {
      it('returns the value');
    });

    describe('when node is a textarea', function () {
      it('returns the value');
    });

    describe('when node is a text input', function () {
      it('returns the value');
    });

    describe('when node is any other node', function () {
      it('returns the value');
    });
  });

  describe('significant', function () {
    it('returns a data structure representing the significant nodes');
  });

  describe('isSignificant', function () {
    it('returns true if the node is a prop');
    it('returns true if the node is a scope');
    it('returns false if the node is insignificant');
  });

  describe('mutable', function () {
    it('returns a data structure representing the mutable nodes');
  });

  describe('isMutable', function () {
    it('returns true when the node is a form');
    it('returns true when the node is an enabled input');
    it('returns false when the node is a disabled input');
    it('returns false when the node is not mutable');
  });

  describe('trigger', function () {
    it('triggers the event on the node');
    it('mixes in event data on the node');
  });

  describe('replaceEventListener', function () {
    it('removes the current event listener');
    it('attaches the new event listener');
  });

  describe('scope', function () {
    describe('when the node is a scope', function () {
      it('returns the node');
    });

    describe('when the scope is within the node', function () {
      it('finds and returns the scoped node');
    });
  });

  describe('scopeName', function () {
    describe('when the node is a scope', function () {
      it('returns the scope name');
    });

    describe('when the scope is within the node', function () {
      it('finds and returns the scope name');
    });
  });

  describe('prop', function () {
    describe('when the node is a prop', function () {
      it('returns the node');
    });

    describe('when the prop is within the node', function () {
      it('finds and returns the proped node');
    });
  });

  describe('propName', function () {
    describe('when the node is a prop', function () {
      it('returns the prop name');
    });

    describe('when the prop is within the node', function () {
      it('finds and returns the prop name');
    });
  });

  describe('with', function () {
    it('calls the fn with the node');
  });

  describe('for', function () {
    it('calls the fn for each node');
  });

  describe('match', function () {
    describe('when there is more data than nodes', function () {
      it('matches the nodes to the data');
    });

    describe('when there are more nodes than data', function () {
      it('matches the nodes to the data');
    });
  });

  describe('repeat', function () {
    it('matches the nodes to the data');
    it('calls the fn with each node and datum');
  });

  describe('bind', function () {
    it('binds the data to the nodes');
    it('sets the id on the node');
  });

  describe('apply', function () {
    it('matches the nodes to the data');
    it('binds the data to the nodes');
  });

  describe('findBindings', function () {
    it('returns a data structure representing the bindings');
  });

  describe('bindDataToScope', function () {
    it('binds the data');
  });

  describe('bindAttributesToNode', function () {
    it('binds the attributes');
  });

  describe('bindValueToNode', function () {
    it('binds the value');
  });

  describe('isTagWithoutValue', function () {
    describe('when the tag has a value', function () {
      it('returns true');
    });

    describe('when the tag does not have a value', function () {
      it('returns false');
    });
  });

  describe('isSelfClosingTag', function () {
    describe('when the tag is self closing', function () {
      it('returns true');
    });

    describe('when the tag is not self closing', function () {
      it('returns false');
    });
  });

  describe('breadthFirst', function () {
    it('iterates over the nodes');
  });

  describe('isNodeList', function () {
    describe('and it is a node list', function () {
      it('returns true');
    });

    describe('and it is not a node list', function () {
      it('returns false');
    });
  });

  describe('byAttr', function () {
    describe('called with a compare value', function () {
      it('iterates over the nodes that include the compare value');
    });

    describe('called without a compare value', function () {
      it('iterates over the nodes that define the attribute');
    });
  });

  describe('setAttr', function () {
    it('sets the attribute value on the node', function () {
      pw.node.setAttr(node, 'title', 'foo');
      expect(node.title).to.equal('foo');
    });
  });

  describe('removeAttr', function () {
    it('removes the attribute from the node', function () {
      node.title = 'foo';
      pw.node.removeAttr(node, 'title');
      expect(node.title).to.equal('');
    });
  });

  describe('hasAttr', function () {
    it('returns true if the node has the attribute', function () {
      node.title = 'foo';
      expect(pw.node.hasAttr(node, 'title')).to.equal(true);
    });

    it('returns false if the node does not have the attribute', function () {
      expect(pw.node.hasAttr(node, 'title')).to.equal(false);
    });
  });

  describe('getAttr', function () {
    it('returns the attribute from the node', function () {
      node.title = 'foo';
      expect(pw.node.getAttr(node, 'title')).to.equal('foo');
    });
  });

  describe('all', function () {
    it('returns a collection of all the nodes');
  });

  describe('clone', function () {
    it('clones the node');
  });

  describe('before', function () {
    it('inserts the node before the node');
  });

  describe('after', function () {
    it('inserts the node after the node');
  });

  describe('replace', function () {
    it('replaces the node with the node');
  });

  describe('append', function () {
    it('appends the node to the node');
  });

  describe('prepend', function () {
    it('prepends the node to the node');
  });

  describe('remove', function () {
    it('removes the node');
  });

  describe('text', function () {
    it('sets the text of the node');
  });
});
