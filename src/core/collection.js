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
  this._scope = scope;
};

pw_Collection.prototype = {
  clone: function () {
    return pw.collection.init(this.views.map(function (view) {
      return view.clone();
    }));
  },

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

  addView: function(view_or_views) {
    var views = [];

    if (view_or_views instanceof pw_Collection) {
      views = view_or_views.views;
    } else {
      views.push(view_or_views);
    }

    if (this.length() > 0) {
      views.forEach(function (view) {
        pw.node.after(this.last().node, view.node);
      }, this);
    } else if (this.parent) {
      views.forEach(function (view) {
        this.parent.append(view);
      }, this);
    }

    this.views = this.views.concat(views);
  },

  order: function (orderedIds) {
    orderedIds.forEach(function (id) {
      if (!id) {
        return;
      }

      var match = this.views[i];
      var matchId = match.node.getAttribute('data-id');
      if (matchId && matchId != id.toString()) {
        match.node.parentNode.appendChild(match.node);

        // also reorder the list of views
        var i = this.views.indexOf(match);
        this.views.splice(i, 1);
        this.views.push(match);
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

  invoke: function (cb) {
    pw.node.invoke(this.views, cb);
  },

  invokeWithData: function(data, fn) {
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
      var firstView;
      var firstParent;

      if (this.views[0]) {
        firstView = this.views[0].clone();
        firstParent = this.views[0].node.parentNode;
      }

      this.views.slice(0).forEach(function (view) {
        var id = view.node.getAttribute('data-id');

        if (!id && data[0].id) {
          this.removeView(view);
          return;
        } else if (id) {
          if (!data.find(function (datum) { return datum.id && datum.id.toString() === id })) {
            this.removeView(view);
          }
        }
      }, this);

      if (data.length > this.length()) {
        var self = this;
        this.endpoint.template(this, function (view) {
          if (!view) {
            view = firstView.clone();
            self.parent = pw.view.init(firstParent);
          }

          data.forEach(function (datum) {
            if (!self.views.find(function (view) {
              return view.node.getAttribute('data-id') === (datum.id || '').toString()
            })) {
              var viewToAdd = view.clone();

              if (viewToAdd instanceof pw_Collection) {
                viewToAdd = viewToAdd.views[0];
              }

              viewToAdd.node.setAttribute('data-id', datum.id);
              self.addView(viewToAdd);

              pw.component.findAndInit(viewToAdd.node);
            }
          }, self);

          return fn.call(self);
        });
      } else {
        return fn.call(this);
      }
    }

    return this;
  },

  repeat: function (data, fn) {
    this.match(data, function () {
      this.invokeWithData(data, fn);
    });
  },

  bind: function (data, fn) {
    this.invokeWithData(data, function(datum) {
      this.bind(datum);

      if(!(typeof fn === 'undefined')) {
        fn.call(this, datum);
      }
    });

    return this;
  },

  apply: function (data, fn) {
    this.match(data, function () {
      var id;

      this.order(data.map(function (datum) {
        if (id = datum.id) {
          return id.toString();
        }
      }));

      this.bind(data, fn);
    });
  },

  version: function (data, fn) {
    var self = this;
    this.match(data, function () {
      this.invokeWithData(data, fn);
    });
  },

  setEndpoint: function (endpoint) {
    this.endpoint = endpoint;
    return this;
  },

  use: function (version, cb) {
    if (this.length() == 1) {
      this.views[0].use(version, cb);
    } else {
      console.log('Not sure how to call `use` on a collection with more than one view');
    }
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
