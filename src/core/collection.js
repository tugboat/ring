pw.collection = {
  init: function (view_or_views, parent, scope) {
    if (view_or_views instanceof pw_Collection) {
      return view_or_views
    } else if (view_or_views.constructor !== Array) {
      view_or_views = [view_or_views];
    }

    return new pw_Collection(view_or_views, parent, scope);
  },

  fromNodes: function (nodes, parent, scope) {
    return pw.collection.init(nodes.map(function (node) {
      return pw.view.init(node);
    }), parent, scope);
  }
};

var pw_Collection = function (views, parent, scope) {
  this.views = views;
  this.parent = parent;
  this.scope = scope;
};

pw_Collection.prototype = {
  last: function () {
    return this.views[this.length() - 1];
  },

  first: function () {
    return this.views[0];
  },

  removeView: function(view) {
    var index = this.views.indexOf(view);

    if (index > -1) {
      this.views.splice(index, 1)[0].remove();
    }
  },

  addView: function(view) {
    if (this.length() > 0) {
      pw.node.after(this.last().node, view.node);
    } else if (this.parent) {
      this.parent.append(view);
    }

    pw.component.findAndInit(view.node);

    this.views.push(view);
  },

  order: function (orderedIds) {
    var match;

    orderedIds.forEach(function (id) {
      var match = this.views.find(function (view) {
        return parseInt(view.node.getAttribute('data-id')) === id;
      });

      if (match) {
        match.node.parentNode.appendChild(match.node);
      }
    }, this);
  },

  length: function () {
    return this.views.length;
  },

  // pakyow api

  attrs: function () {
    return pw.attrs.init(this.views);
  },

  append: function (data) {
    data = Array.ensure(data);

    var last = this.last();
    this.views.push(last.append(data));
    return last;
  },

  prepend: function(data) {
    data = Array.ensure(data);

    var prependedViews = data.map(function (datum) {
      var view = this.first().prepend(datum);
      this.views.push(view);
      return view;
    }, this);

    return pw.collection.init(prependedViews);
  },

  with: function (cb) {
    pw.node.with(this.views, cb);
  },

  for: function(data, fn) {
    data = Array.ensure(data);

    this.views.forEach(function (view, i) {
      fn.call(view, data[i]);
    });
  },

  match: function (data, fn) {
    data = Array.ensure(data);

    if (data.length === 0) {
      this.remove();
      return fn.call(this);
    } else {
      this.views.forEach(function (view) {
        var id = view.node.getAttribute('data-id');

        if (!id) {
          return;
        }

        if (!data.find(function (datum) { return datum.id.toString() === id })) {
          this.removeView(view);
        }
      }, this);

      if (data.length > this.length()) {
        var self = this;
        this.endpoint.template(this, function (view) {
          if (!view) {
            view = self.views[0].clone();
            self.parent = pw.view.init(self.views[0].node.parentNode);
            self.removeView(self.views[0]);
          }

          data.forEach(function (datum) {
            if (!self.views.find(function (view) {
              return view.node.getAttribute('data-id') === (datum.id || '').toString()
            })) {
              self.addView(view.clone());
            }
          }, self);

          return fn.call(self);
        });
      }

      return fn.call(this);
    }

    return this;
  },

  repeat: function (data, fn) {
    this.match(data, function () {
      this.for(data, fn);
    });
  },

  bind: function (data, fn) {
    this.for(data, function(datum) {
      this.bind(datum);

      if(!(typeof fn === 'undefined')) {
        fn.call(this, datum);
      }
    });

    return this;
  },

  apply: function (data, fn) {
    this.match(data, function () {
      this.bind(data, fn);
      var id;
      this.order(data.map(function (datum) {
        if (id = datum.id) {
          return id.toString();
        }
      }));
    });
  },

  endpoint: function (endpoint) {
    this.endpoint = endpoint;
    return this;
  }
};

// lookup functions
['scope', 'prop', 'component'].forEach(function (method) {
  pw_Collection.prototype[method] = function (name) {
    return pw.collection.init(
      this.views.reduce(function (views, view) {
        return views.concat(view[method](name).views);
      }, [])
    );
  };
});

// pass through functions
['remove', 'clear', 'text', 'html'].forEach(function (method) {
  pw_Collection.prototype[method] = function (arg) {
    this.views.forEach(function (view) {
      view[method](arg);
    });
  };
});
