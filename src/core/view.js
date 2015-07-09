/*
  View related functions.
*/

pw.view = {
  // creates and returns a new pw_View for the document or node
  init: function (node) {
    return new pw_View(node);
  }
};

/*
  pw_View contains a document with state. It watches for
  interactions with the document that trigger mutations
  in state. It can also apply state to the view.
*/

var pw_View = function (node) {
  this.node = node;
}

pw_View.prototype = {
  applyState: function (stateArr, nodes) {
    if(!nodes) {
      nodes = pw.node.significant(this.node);
    }

    stateArr.forEach(function (state, i) {
      var node = nodes[i];
      pw.node.bind(state[0], node[0].node);
      this.applyState(state[1], node[1])
    }, this);
  },

  clone: function () {
    return pw.view.init(this.node.cloneNode(true));
  },

  // pakyow api

  remove: function () {
    pw.node.remove(this.node);
  },

  clear: function () {
    pw.node.clear(this.node);
  },

  title: function (value) {
    pw.node.title(this.node, value);
  },

  text: function (value) {
    this.node.innerText = value;
  },

  html: function (value) {
    this.node.innerHTML = value
  },

  after: function (view) {
    pw.node.after(this.node, view.node);
  },

  before: function (view) {
    pw.node.before(this.node, view.node);
  },

  replace: function (view) {
    pw.node.replace(this.node, view.node);
  },

  append: function (view_or_data) {
    if (view_or_data instanceof pw_View) {
      pw.node.append(this.node, view_or_data.node);
    } else {
      this.fetchAndTransformView(function (view) {
        view.bind(view_or_data);
        this.after(view);
      });
    }
  },

  prepend: function (view_or_data) {
    if (view_or_data instanceof pw_View) {
      pw.node.prepend(this.node, view_or_data.node);
    } else {
      this.fetchAndTransformView(function (view) {
        view.bind(view_or_data);
        this.before(view);
      });
    }
  },

  insert: function (view_or_data, atIndex) {
    if (view_or_data instanceof pw_View) {
      pw.node.insert(this.node, view_or_data.node, atIndex);
    } else {
      this.fetchAndTransformView(function (view) {
        view.bind(view_or_data);
        this.insert(view, atIndex);
      });
    }
  },

  fetchAndTransformView: function (transformFn) {
    var that = this;
    socket.fetchView({ component: 'chat', scope: 'message' }, function (view) {
      transformFn.call(that, view);

      if (that.versionName() == 'empty') {
        that.remove();
      }
    });
  },

  attrs: function () {
    return pw.attrs.init(this);
  },

  scope: function (name) {
    return pw.collection.init(
      pw.node.byAttr(this.node, 'data-scope', name).reduce(function (views, node) {
        return views.concat(pw.view.init(node));
      }, [])
    );
  },

  prop: function (name) {
    return pw.collection.init(
      pw.node.byAttr(this.node, 'data-prop', name).reduce(function (views, node) {
        return views.concat(pw.view.init(node));
      }, [])
    );
  },

  component: function (name) {
    return pw.collection.init(
      pw.node.byAttr(this.node, 'data-ui', name).reduce(function (views, node) {
        return views.concat(pw.view.init(node));
      }, [])
    );
  },

  with: function (cb) {
    pw.node.with(this.node, cb);
  },

  match: function (data) {
    pw.node.match(this.node, data);
  },

  for: function (data, cb) {
    pw.node.for(this.node, data, cb);
  },

  repeat: function (data, cb) {
    pw.node.repeat(this.node, data, cb);
  },

  bind: function (data, cb) {
    pw.node.bind(data, this.node, cb);
  },

  apply: function (data, cb) {
    pw.node.apply(data, this.node, cb);
  },

  versionName: function () {
    return pw.node.versionName(this.node);
  }
};
