/*
  View related functions.
*/

pw.view = {
  // creates and returns a new pw_View for the document or node
  init: function (node) {
    return new pw_View(node);
  },

  fromStr: function (str) {
    var nodeType = 'div';

    if (str.match(/^<tr/) || str.match(/^<tbody/)) {
      nodeType = 'table';
    }

    var e = document.createElement(nodeType);
    e.innerHTML = str;

    return pw.view.init(e.childNodes[0]);
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
  clone: function () {
    return pw.view.init(this.node.cloneNode(true));
  },

  // pakyow api

  title: function (value) {
    pw.node.title(this.node, value);
  },

  text: function (value) {
    this.node.innerText = value;
  },

  html: function (value) {
    this.node.innerHTML = value
  },

  component: function (name) {
    return pw.collection.init(
      pw.node.byAttr(this.node, 'data-ui', name).reduce(function (views, node) {
        return views.concat(pw.view.init(node));
      }, []), this);
  },

  attrs: function () {
    return pw.attrs.init(this);
  },

  invoke: function (cb) {
    pw.node.invoke(this.node, cb);
  },

  match: function (data) {
    pw.node.match(this.node, data);
  },

  invokeWithData: function (data, cb) {
    pw.node.invokeWithData(this.node, data, cb);
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

  use: function (version, cb) {
    var self = this;

    if (this.node.getAttribute('data-version') != version) {
      this.node.setAttribute('data-version', version);

      var lookup = {
        scope: this.node.getAttribute('data-scope'),
        version: version
      };

      window.socket.fetchView(lookup, function (view) {
        view.node.setAttribute('data-channel', self.node.getAttribute('data-channel'));
        pw.node.replace(self.node, view.node);
        self.node = view.node;
        cb();
      });
    } else {
      cb();
    }
  },

  setEndpoint: function (endpoint) {
    this.endpoint = endpoint;
    return this;
  },

  first: function () {
    return this;
  }
};

// pass through lookups
['scope', 'prop'].forEach(function (method) {
  pw_View.prototype[method] = function (name) {
    return pw.collection.init(
      pw.node.byAttr(this.node, 'data-' + method, name).reduce(function (views, node) {
        return views.concat(pw.view.init(node));
      }, []), this, name);
  };
});

// pass through functions without view
['remove', 'clear', 'versionName'].forEach(function (method) {
  pw_View.prototype[method] = function () {
    return pw.node[method](this.node);
  };
});

// pass through functions with view
['after', 'before', 'replace', 'append', 'prepend', 'insert'].forEach(function (method) {
  pw_View.prototype[method] = function (view) {
    return pw.node[method](this.node, view.node);
  };
});
