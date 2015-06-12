pw.collection = {};

pw.collection.init = function (view_or_views, selector) {
  if (view_or_views instanceof pw_Collection) {
    return view_or_views
  } else if (view_or_views.constructor !== Array) {
    view_or_views = [view_or_views];
  }

  return new pw_Collection(view_or_views, selector);
};

pw.collection.fromNodes = function (nodes, selector) {
  return pw.collection.init(_.map(nodes, function (node) {
    return pw.view.init(node);
  }), selector);
}

var pw_Collection = function (views, selector) {
  this.views = views;
  this.selector = selector;
};

pw_Collection.prototype.find = function (query) {
  var localSelector = this.selector;

  _.each(_.pairs(query), function (pair) {
    localSelector += '[data-' + pair[0] + '="' + pair[1] + '"]';
  });

  return pw.collection.fromNodes(document.querySelectorAll(localSelector), localSelector);
};

pw_Collection.prototype.removeView = function(view) {
  view.remove();
  this.views = _.without(this.views, _.findWhere(this.views, view));
};

pw_Collection.prototype.addView = function(view) {
  var lastView = this.views[this.views.length - 1];
  pw.node.after(lastView.node, view.node);
  this.views.push(view);
};

//TODO look into a more efficient way of reordering nodes
pw_Collection.prototype.order = function (orderedIds) {
  _.each(orderedIds, function (id) {
    var match = _.find(this.views, function (view) {
      return parseInt(view.node.getAttribute('data-id')) === id;
    });

    match.node.parentNode.appendChild(match.node);
  }, this);
};

pw_Collection.prototype.length = function () {
  return this.views.length;
};

// pakyow api

pw_Collection.prototype.attrs = function () {
  return pw.attrs.init(this.views);
};

pw_Collection.prototype.remove = function() {
  _.each(this.views, function (view) {
    view.remove();
  });
};

pw_Collection.prototype.clear = function() {
  _.each(this.views, function (view) {
    view.clear();
  });
};

pw_Collection.prototype.text = function(value) {
  _.each(this.views, function (view) {
    view.text(value);
  });
};

pw_Collection.prototype.html = function(value) {
  _.each(this.views, function (view) {
    view.html(value);
  });
};

pw_Collection.prototype.append = function (data) {
  if(!(data instanceof Array)) data = [data];
  var last = this.views[this.views.length - 1];
  this.views.push(last.append(data));
  return last;
};

pw_Collection.prototype.prepend = function(data) {
  if(!(data instanceof Array)) data = [data];
  var firstView = this.views[0];

  var prependedViews = _.map(data, function (datum) {
    var view = firstView.prepend(datum);
    this.views.push(view);
    return view;
  }, this);

  return pw.collection.init(prependedViews);
};

pw_Collection.prototype.scope = function (name) {
  return pw.collection.init(
    _.reduce(this.views, function (views, view) {
      return views.concat(view.scope(name));
    }, [])
  );
};

pw_Collection.prototype.prop = function (name) {
  return pw.collection.init(
    _.reduce(this.views, function (views, view) {
      return views.concat(view.prop(name));
    }, [])
  );
};

pw_Collection.prototype.component = function (name) {
  return pw.collection.init(
    _.reduce(this.views, function (views, view) {
      return views.concat(view.component(name));
    }, [])
  );
};

pw_Collection.prototype.with = function (cb) {
  pw.node.with(this.views, cb);
};

pw_Collection.prototype.for = function(data, fn) {
  if(!(data instanceof Array)) data = [data];

  _.each(this.views, function (view, i) {
    fn.call(view, data[i]);
  });
};

pw_Collection.prototype.match = function (data, fn) {
  if(!(data instanceof Array)) data = [data];

  if (data.length === 0) {
    this.remove();
    return fn.call(this);
  } else {
    _.each(this.views, function (view) {
      var id = parseInt(view.node.getAttribute('data-id'));
      if (!id) return;
      if (!_.find(data, function (datum) { return datum.id === id })) {
        this.removeView(view);
      }
    }, this);

    if (data.length > this.views.length) {
      var channel = this.views[0].node.getAttribute('data-channel');
      var that = this;

      window.socket.fetchView(channel, function (view) {
        _.each(data, function (datum) {
          if (!_.find(that.views, function (view) { return parseInt(view.node.getAttribute('data-id')) === datum.id })) {
            that.addView(view.clone());
          }
        }, that);

        return fn.call(that);
      });
    } else {
      return fn.call(this);
    }
  }

  return this;
};

pw_Collection.prototype.repeat = function (data, fn) {
  this.match(data, function () {
    this.for(data, fn);
  });
};

pw_Collection.prototype.bind = function (data, fn) {
  this.for(data, function(datum) {
    this.bind(datum);
    if(!(typeof fn === 'undefined')) fn.call(this, datum);
  });

  return this;
};

pw_Collection.prototype.apply = function (data, fn) {
  this.match(data, function () {
    this.bind(data, fn);
    this.order(_.map(data, function (datum) { return datum.id; }))
  });
};
