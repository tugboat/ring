/*
  State related functions.
*/

pw.state = {
  build: function (sigArr, parentObj) {
    var nodeState;
    return sigArr.reduce(function (acc, sig) {
      if (nodeState = pw.state.buildForNode(sig, parentObj)) {
        acc.push(nodeState);
      }

      return acc;
    }, []);
  },

  buildForNode: function (sigTuple, parentObj) {
    var sig = sigTuple[0];
    var obj = {};

    if (sig.type === 'scope') {
      obj.id = sig.node.getAttribute('data-id');
      obj.scope = sig.node.getAttribute('data-scope');
    } else if (sig.type === 'prop' && parentObj) {
      parentObj[sig.node.getAttribute('data-prop')] = pw.node.value(sig.node);
      return;
    }

    obj['__nested'] = pw.state.build(sigTuple[1], obj);

    return obj;
  },

  // creates and returns a new pw_State for the document or node
  init: function (node, observer) {
    return new pw_State(node, observer);
  }
};


/*
  pw_State represents the state for a document or node.
*/

var pw_State = function (node) {
  this.node = node;
  //FIXME storing diffs is probably better than full snapshots
  this.snapshots = [];
  this.update();
}

pw_State.prototype = {
  update: function () {
    this.snapshots.push(pw.state.build(pw.node.significant(this.node)));
  },

  // gets the current represented state from the node and diffs it with the current state
  diffNode: function (node) {
    return pw.state.build(pw.node.significant(pw.node.scope(node)))[0];
  },

  revert: function () {
    var initial = pw.util.dup(this.snapshots[0]);
    this.snapshots = [initial];
    return initial;
  },

  rollback: function () {
    this.snapshots.pop();
    return this.current();
  },

  // returns the current state for a node
  node: function (nodeState) {
    return this.current.flatten().find(function (state) {
      return state.scope === nodeState.scope && state.id === nodeState.id;
    });
  },

  append: function (state) {
    var copy = this.copy();
    copy.push(state);
    this.snapshots.push(copy);
  },

  prepend: function (state) {
    var copy = this.copy();
    copy.unshift(state);
    this.snapshots.push(copy);
  },

  delete: function (state) {
    var copy = this.copy();
    var match = copy.find(function (s) {
      return s.id === state.id;
    });

    if (match) {
      copy.splice(copy.indexOf(match), 1);
      this.snapshots.push(copy);
    }
  },

  copy: function () {
    return pw.util.dup(this.current());
  },

  current: function () {
    return this.snapshots[this.snapshots.length - 1];
  },

  initial: function () {
    return this.snapshots[0];
  }
};
