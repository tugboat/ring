pw.node = {};

// returns the value of the node
pw.node.value = function (n) {
  if (n.tagName === 'INPUT') {
    if (n.type === 'checkbox') {
      if (n.checked) {
        return n.name ? n.name : true;
      } else {
        return false;
      }
    }

    return n.value;
  } else if (n.tagName === 'TEXTAREA') {
    return n.value;
  }

  return n.textContent.trim();
}

/*
  Returns a representation of the node's state. Example:

  <div data-scope="list" data-id="1">
    <div data-scope="task" data-id="1">
      <label data-prop="desc">
        foo
      </label>
    </div>
  </div>

  [ [ { node: ..., id: '1', scope: 'list' }, [ { node: ..., id: '1', scope: 'task' }, [ { node: ..., prop: 'body' } ] ] ] ]
*/

pw.node.significant = function(n, arr) {
  if(n === document) n = document.getElementsByTagName('body')[0];
  if(arr === undefined) arr = [];

  //TODO optimize this method
  var sigInfo, sigObj, sigArr, nextArr;
  if(sigInfo = pw.node.isSignificant(n)) {
    sigObj = { node: sigInfo[0], type: sigInfo[1] };
    sigArr = [sigObj, []];
    arr.push(sigArr);

    nextArr = sigArr[1];
  } else {
    nextArr = arr;
  }

  var children = n.children;
  for(var i = 0; i < children.length; i++) {
    pw.node.significant(children[i], nextArr);
  }

  return arr;
}

// attributes that would make a node significant
var sigAttrs = ['data-scope', 'data-prop'];

// returns node and an indication of it's significance
// (e.g value of scope/prop); returns false otherwise
pw.node.isSignificant = function(node) {
  var attr;

  //TODO use each
  for(var i = 0; i < sigAttrs.length; i++) {
    attr = sigAttrs[i]

    if(node.hasAttribute(attr)) {
      return [node, attr.split('-')[1]];
    }
  }

  return false;
}

pw.node.mutable = function (n) {
  pw.node.significant(n).flatten().filter(function (n) {
    return pw.node.isMutable(n.node);
  }).map(function (n) {
    return n.node;
  });
}

// returns true if the node can mutate via interaction
pw.node.isMutable = function(n) {
  var t = n.tagName;
  if (t === 'FORM' || (t === 'INPUT' && !n.disabled)) {
    return true;
  }

  return false;
}

// triggers event name on node with data
pw.node.trigger = function (en, n, d) {
  var e = document.createEvent('Event');
  e.initEvent(en, true, true);
  n._evtData = d;
  n.dispatchEvent(e);
}

// replaces an event listener's callback for node by name
pw.node.replaceEventListener = function (en, n, cb) {
  n.removeEventListener(en);
  n.addEventListener(en, cb);
}

// finds and returns scope for node
pw.node.scope = function (node) {
  if (node.getAttribute('data-scope')) {
    return node;
  }

  return pw.node.scope(node.parentNode);
}

// returns the name of the scope for node
pw.node.scopeName = function (node) {
  if (node.getAttribute('data-scope')) {
    return node.getAttribute('data-scope');
  }

  return pw.node.scopeName(node.parentNode);
}

// finds and returns prop for node
pw.node.prop = function (node) {
  if (node.getAttribute('data-prop')) {
    return node;
  }

  return pw.node.prop(node.parentNode);
}

// returns the name of the prop for node
pw.node.propName = function (node) {
  if (node.getAttribute('data-prop')) {
    return node.getAttribute('data-prop');
  }

  return pw.node.propName(node.parentNode);
}

// returns the name of the version for node
pw.node.versionName = function (node) {
  if (node.hasAttribute('data-version')) {
    return node.getAttribute('data-version');
  }
}

// creates a context in which view manipulations can occur
pw.node.with = function(node, cb) {
  cb.call(node);
};

pw.node.for = function(node, data, cb) {
  if(!(node instanceof Array)) {
    node = [node];
  } else if (pw.node.isNodeList(node)) {
    node = Array.prototype.slice.call(node);
  }

  if(!(data instanceof Array)) {
    data = [data];
  }

  node.forEach(function (e, i) {
    cb.call(e, data[i]);
  });
};

pw.node.match = function(node, data) {
  if(!(node instanceof Array) && !pw.node.isNodeList(node)) {
    node = [node];
  }

  if(!(data instanceof Array)) {
    data = [data];
  }

  var collection = [];
  //TODO use each
  for(var i = 0; i < data.length; i++) {
    var view = node[i];

    // out of views, use the last one
    if(!view) {
      view = node[node.length - 1];
    }

    var dup = view.cloneNode(true);
    view.parentNode.insertBefore(dup);

    collection.push(dup);
  }

  for(var i = 0; i < node.length; i++) {
    node[i].parentNode.removeChild(node[i]);
  }

  return collection;
};

pw.node.repeat = function(node, data, cb) {
  pw.node.for(pw.node.match(node, data), data, cb);
};

// binds an object to a node
pw.node.bind = function (data, node, cb) {
  //TODO be smarter about when bindings are found
  // or use significant for view instance and pass?
  var bindings = pw.node.findBindings(node);
  var scope = bindings[0];

  pw.node.for(node, data, function(datum) {
    if (!datum) return;

    if(datum.id) this.setAttribute('data-id', datum.id);
    pw.node.bindDataToScope(datum, scope, node);
    if(!(typeof cb === 'undefined')) cb.call(this, datum);
  });
}

pw.node.apply = function (data, node, cb) {
  var coll = pw.node.match(node, data);
  pw.node.bind(data, coll, cb);
  return coll;
}

pw.node.findBindings = function (node) {
  var bindings = [];
  pw.node.breadthFirst(node, function() {
    var o = this;
    var scope = o.getAttribute('data-scope');
    if(!scope) return;

    var props = [];
    pw.node.breadthFirst(o, function() {
      var so = this;

      // don't go into deeper scopes
      if(o != so && so.getAttribute('data-scope')) return;

      var prop = so.getAttribute('data-prop');
      if(!prop) return;
      props.push({ prop:prop, doc:so });
    });

    bindings.push({ scope: scope, doc: o, props: props });
  });

  return bindings;
}

pw.node.bindDataToScope = function (data, scope, node) {
  if(!data) return;
  if(!scope) return;

  //TODO use each
  for(var i = 0; i < scope['props'].length; i++) {
    var p = scope['props'][i];

    k = p['prop'];
    v = data[k];

    if(!v) {
      v = '';
    }

    if(typeof v === 'object') {
      pw.node.bindValueToNode(v['__content'], p['doc']);
      pw.node.bindAttributesToNode(v['__attrs'], p['doc']);
    } else {
      pw.node.bindValueToNode(v, p['doc']);
    }
  }
}

pw.node.bindAttributesToNode = function (attrs, doc) {
  var pwAttrs = pw.attrs.init(pw.view.init(doc));

  for(var attr in attrs) {
    var value = attrs[attr];
    if(typeof value === 'function') {
      value = value.call(doc.getAttribute(attr));
    }

    if (value) {
      if (value instanceof Array) {
        value.forEach(function (attrInstruct) {
          pwAttrs[attrInstruct[0]](attr, attrInstruct[1]);
        });
      } else {
        pwAttrs.set(attr, value);
      }
    } else {
      pwAttrs.remove(attr);
    }
  }
}

pw.node.bindValueToNode = function (value, doc) {
  if(pw.node.isTagWithoutValue(doc)) return;

  //TODO handle other form fields (port from pakyow-presenter)
  if (doc.tagName === 'INPUT' && doc.type === 'checkbox') {
    if (value === true || (doc.value && value === doc.value)) {
      doc.checked = true;
    } else {
      doc.checked = false;
    }
  } else {
    if (pw.node.isSelfClosingTag(doc)) {
      doc.value = value;
    } else {
      doc.innerHTML = value;
    }
  }
}

var valuelessTags = ['SELECT'];
pw.node.isTagWithoutValue = function(node) {
  return valuelessTags.indexOf(node.tagName) != -1 ? true : false;
};

var selfClosingTags = ['AREA', 'BASE', 'BASEFONT', 'BR', 'HR', 'INPUT', 'IMG', 'LINK', 'META'];
pw.node.isSelfClosingTag = function(node) {
  return selfClosingTags.indexOf(node.tagName) != -1 ? true : false;
};

pw.node.breadthFirst = function (node, cb) {
  var queue = [node];
  while (queue.length > 0) {
    var subNode = queue.shift();
    if (!subNode) continue;
    if(typeof subNode == "object" && "nodeType" in subNode && subNode.nodeType === 1 && subNode.cloneNode) {
      cb.call(subNode);
    }

    var children = subNode.childNodes;
    if (children) {
      for(var i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }
  }
}

pw.node.isNodeList = function(nodes) {
  return typeof nodes.length !== 'undefined';
}

pw.node.byAttr = function (node, attr, compareValue) {
  var arr = [];
  var os = pw.node.all(node);
  //TODO use each
  for(var i = 0; i < os.length; i++) {
    var o = os[i];
    var value = o.getAttribute(attr);

    if(value !== null && ((typeof compareValue) === 'undefined' || value == compareValue)) {
      arr.push(o);
    }
  }

  return arr;
}

pw.node.setAttr = function (node, attr, value) {
  if (attr === 'class') {
    node.setAttribute(attr, value.join(' '));
  } else if (attr === 'style') {
    _.each(_.pairs(value), function (kv) {
      node.style[kv[0]] = kv[1];
    });
  } else {
    node.setAttribute(attr, value);
  }
}

pw.node.removeAttr = function (node, attr) {
  node.removeAttribute(attr);
}

pw.node.hasAttr = function (node, attr) {
  return node.hasAttribute(attr);
}

pw.node.getAttr = function (node, attr) {
  return node.getAttribute(attr);
}

pw.node.all = function (node) {
  var arr = [];

  if(document !== node) arr.push(node);

  var os = node.getElementsByTagName('*');
  //TODO use each
  for(var i = 0; i < os.length; i++) {
    arr.push(os[i]);
  }

  return arr;
}

pw.node.clone = function (node) {
  return node.cloneNode(true);
}

pw.node.before = function (node, newNode) {
  node.parentNode.insertBefore(newNode, node);
}

pw.node.after = function (node, newNode) {
  node.parentNode.insertBefore(newNode, this.nextSibling);
}

pw.node.replace = function (node, newNode) {
  node.parentNode.replaceChild(newNode, node);
};

pw.node.append = function (node, newNode) {
  node.appendChild(newNode);
}

pw.node.prepend = function (node, newNode) {
  node.insertBefore(newNode, node.firstChild);
}

pw.node.remove = function (node) {
  node.parentNode.removeChild(node);
};

pw.node.text = function (node, value) {
  node.innerText = value;
};

pw.node.html = function (node, value) {
  node.innerHTML = value;
};

pw.node.clear = function (node) {
  while (node.firstChild) {
    pw.node.remove(node.firstChild);
  }
};

pw.node.title = function (node, value) {
  var titleNode = node.getElementsByTagName('title')[0];

  if (titleNode) {
    pw.node.text(titleNode, value);
  }
};
