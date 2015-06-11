/*
  View related functions.
*/

pw.view = {};

// creates and returns a new pw_View for the document or node
pw.view.init = function (node) {
  return new pw_View(node);
}

/*
  pw_View contains a document with state. It watches for
  interactions with the document that trigger mutations
  in state. It can also apply state to the view.
*/

var pw_View = function (node) {
  this.node = node;
}

pw_View.prototype.applyState = function (stateArr, nodes) {
  if(!nodes) {
    nodes = pw.node.significant(this.node);
  }

  _.each(stateArr, function (state, i) {
    var node = nodes[i];
    pw.node.bind(state[0], node[0].node);
    this.applyState(state[1], node[1])
  }, this);
};

pw_View.prototype.clone = function () {
  return pw.view.init(pw.node.clone(this.node));
}

// pakyow api

pw_View.prototype.remove = function () {
  pw.node.remove(this.node);
};

//TODO clear, title

pw_View.prototype.text = function (value) {
  pw.node.text(node, value);
};

//TODO html, append, prepend, after, before, replace

pw_View.prototype.attrs = function () {
  return pw.attrs.init(this);
};

//TODO scope

pw_View.prototype.prop = function (name) {
  return _.map(pw.node.byAttr(this.node, 'data-prop', name), function (node) {
    return pw.view.init(node);
  });
};

//TODO component, with, match, for, repeat

pw_View.prototype.bind = function (data) {
  pw.node.bind(data, this.node);
};

//TODO apply
