pw.attrs = {};

pw.attrs.init = function (view_or_views) {
  var views;
  if (view_or_views instanceof pw_View) {
    views = [view_or_views];
  } else {
    views = view_or_views;
  }

  return new pw_Attrs(views);
};

var attrTypes = {
  hash: ['style'],
  bool: ['selected', 'checked', 'disabled', 'readonly', 'multiple'],
  mult: ['class']
};

var pw_Attrs = function (views) {
  this.views = views;
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

  } else if (this.findType(attr) === 'bool') {

  } else { // just a text attr

  }
};

pw_Attrs.prototype.set = function (attr, value) {
  _.each(this.views, function (view) {
    pw.node.setAttr(view.node, attr, value);
  });
};

pw_Attrs.prototype.ensure = function (attr, value) {
  _.each(this.views, function (view) {
    var currentValue = this.findValue(view, attr);
    if (attr === 'class') {
      if (!currentValue.contains(value)) {
        currentValue.add(value);
      }
    } else if (attr === 'style') {

    } else if (this.findType(attr) === 'bool') {

    } else { // just a text attr

    }
  }, this);
};

pw_Attrs.prototype.deny = function (attr, value) {
  _.each(this.views, function (view) {
    var currentValue = this.findValue(view, attr);
    if (attr === 'class') {
      if (currentValue.contains(value)) {
        currentValue.remove(value);
      }
    } else if (attr === 'style') {

    } else if (this.findType(attr) === 'bool') {

    } else { // just a text attr

    }
  }, this);
};
