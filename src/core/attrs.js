pw.attrs = {
  init: function (v_or_vs) {
    return new pw_Attrs(pw.collection.init(v_or_vs));
  }
};

var attrTypes = {
  hash: ['style'],
  bool: ['selected', 'checked', 'disabled', 'readonly', 'multiple'],
  mult: ['class']
};

var pw_Attrs = function (collection) {
  this.views = collection.views;
};

pw_Attrs.prototype = {
  findType: function (attr) {
    if (attrTypes.hash.indexOf(attr) > -1) return 'hash';
    if (attrTypes.bool.indexOf(attr) > -1) return 'bool';
    if (attrTypes.mult.indexOf(attr) > -1) return 'mult';
    return 'text';
  },

  findValue: function (view, attr) {
    switch (attr) {
      case 'class':
        return view.node.classList;
      case 'style':
        return view.node.style;
    }

    if (this.findType(attr) === 'bool') {
      return view.node.hasAttribute(attr);
    } else {
      return view.node.getAttribute(attr);
    }
  },

  set: function (attr, value) {
    this.views.forEach(function (view) {
      pw.node.setAttr(view.node, attr, value);
    });
  },

  remove: function (attr) {
    this.views.forEach(function (view) {
      view.node.removeAttribute(attr);
    });
  },

  ensure: function (attr, value) {
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
        if (!view.node.hasAttribute(attr)) {
          pw.node.setAttr(view.node, attr, attr);
        }
      } else { // just a text attr
        var currentValue = view.node.getAttribute(attr) || '';
        if (!currentValue.match(value)) {
          pw.node.setAttr(view.node, attr, currentValue + value);
        }
      }
    }, this);
  },

  deny: function (attr, value) {
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
        if (view.node.hasAttribute(attr)) {
          view.node.removeAttribute(attr);
        }
      } else { // just a text attr
        pw.node.setAttr(view.node, attr, view.node.getAttribute(attr).replace(value, ''));
      }
    }, this);
  },

  insert: function (attr, value) {
    this.views.forEach(function (view) {
      var currentValue = this.findValue(view, attr);

      switch (attr) {
        case 'class':
          currentValue.add(value);
          break;
        default:
          pw.node.setAttr(view.node, attr, currentValue + value);
          break;
      }
    }, this);
  }
};
