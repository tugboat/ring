pw.attrs = {};

pw.attrs.init = function (view_or_views) {
  return new pw_Attrs(pw.collection.init(view_or_views));
};

var attrTypes = {
  hash: ['style'],
  bool: ['selected', 'checked', 'disabled', 'readonly', 'multiple'],
  mult: ['class']
};

var pw_Attrs = function (collection) {
  this.views = collection.views;
};

pw_Attrs.prototype.findType = function (attr) {
  if (attrTypes.hash.indexOf(attr) > -1) return 'hash';
  if (attrTypes.bool.indexOf(attr) > -1) return 'bool';
  if (attrTypes.mult.indexOf(attr) > -1) return 'mult';
  return 'text';
};

pw_Attrs.prototype.findValue = function (view, attr) {
  if (attr === 'class') {
    return view.node.classList;
  } else if (attr === 'style') {
    return view.node.style;
  } else if (this.findType(attr) === 'bool') {
    return pw.node.hasAttr(view.node, attr);
  } else { // just a text attr
    return pw.node.getAttr(view.node, attr);
  }
};

pw_Attrs.prototype.set = function (attr, value) {
  this.views.forEach(function (view) {
    pw.node.setAttr(view.node, attr, value);
  });
};

pw_Attrs.prototype.remove = function (attr) {
  _.each(this.views, function (view) {
    pw.node.removeAttr(view.node, attr);
  });
};

pw_Attrs.prototype.ensure = function (attr, value) {
  this.views.forEach(function (view) {
    var currentValue = this.findValue(view, attr);

    if (attr === 'class') {
      if (!currentValue.contains(value)) {
        currentValue.add(value);
      }
    } else if (attr === 'style') {
      value.pairs().forEach(function (kv) {
        view.node.style[kv[0]] = kv[1];
      });
    } else if (this.findType(attr) === 'bool') {
      if (!pw.node.hasAttr(view.node, attr)) {
        pw.node.setAttr(view.node, attr, attr);
      }
    } else { // just a text attr
      var currentValue = pw.node.getAttr(view.node, attr) || '';
      if (!currentValue.match(value)) {
        pw.node.setAttr(view.node, attr, currentValue + value);
      }
    }
  }, this);
};

pw_Attrs.prototype.deny = function (attr, value) {
  this.views.forEach(function (view) {
    var currentValue = this.findValue(view, attr);
    if (attr === 'class') {
      if (currentValue.contains(value)) {
        currentValue.remove(value);
      }
    } else if (attr === 'style') {
      value.pairs().forEach(function (kv) {
        view.node.style[kv[0]] = view.node.style[kv[0]].replace(kv[1], '');
      });
    } else if (this.findType(attr) === 'bool') {
      if (pw.node.hasAttr(view.node, attr)) {
        pw.node.removeAttr(view.node, attr);
      }
    } else { // just a text attr
      pw.node.setAttr(view.node, attr, pw.node.getAttr(view.node, attr).replace(value, ''));
    }
  }, this);
};

pw_Attrs.prototype.insert = function (attr, value) {
  _.each(this.views, function (view) {
    var currentValue = this.findValue(view, attr);

    if (attr === 'class') {
      currentValue.add(value);
    } else if (attr === 'style') {
      // no-op
    } else if (this.findType(attr) === 'bool') {
      // no-op
    } else { // just a text attr
      pw.node.setAttr(view.node, attr, currentValue + value);
    }
  }, this);
}
