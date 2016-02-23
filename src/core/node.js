var sigAttrs = ['data-scope', 'data-prop'];
var valuelessTags = ['SELECT'];
var selfClosingTags = ['AREA', 'BASE', 'BASEFONT', 'BR', 'HR', 'INPUT', 'IMG', 'LINK', 'META'];

pw.node = {
  // returns the value of the node
  value: function (node) {
    if (node.tagName === 'INPUT') {
      if (node.type === 'checkbox') {
        if (node.checked) {
          return node.value ? node.value : true;
        } else {
          return false;
        }
      }

      return node.value;
    } else if (node.tagName === 'TEXTAREA') {
      return node.value;
    } else if (node.tagName === 'SELECT') {
      return node.value;
    }

    return node.textContent.trim();
  },

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

  significant: function(node, arr) {
    if(node === document) {
      node = document.getElementsByTagName('body')[0];
    }

    if(arr === undefined) {
      arr = [];
    }

    var sig, nArr;

    if(sig = pw.node.isSignificant(node)) {
      nArr = [];
      arr.push([{ node: sig[0], type: sig[1] }, nArr]);
    } else {
      nArr = arr;
    }

    pw.node.toA(node.children).forEach(function (child) {
      pw.node.significant(child, nArr);
    });

    return arr;
  },

  // returns node and an indication of it's significance
  // (e.g value of scope/prop); returns false otherwise
  isSignificant: function(node) {
    var attr = sigAttrs.find(function (a) {
      return node.hasAttribute(a);
    });

    if (attr) {
      return [node, attr.split('-')[1]];
    } else {
      return false;
    }
  },

  mutable: function (node) {
    pw.node.significant(node).flatten().filter(function (n) {
      return pw.node.isMutable(n.node);
    }).map(function (n) {
      return n.node;
    });
  },

  // returns true if the node can mutate via interaction
  isMutable: function(node) {
    var tag = node.tagName;
    return tag === 'FORM' || (tag === 'INPUT' && !node.disabled);
  },

  // triggers event name on node with data
  trigger: function (evtName, node, data) {
    var evt = document.createEvent('Event');
    evt.initEvent(evtName, true, true);

    node._evtData = data;
    node.dispatchEvent(evt);
  },

  // replaces an event listener's callback for node by name
  replaceEventListener: function (eventName, node, cb) {
    node.removeEventListener(eventName);
    node.addEventListener(eventName, cb);
  },

  inForm: function (node) {
    if (node.tagName === 'FORM') {
      return true;
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.inForm(next);
    }
  },

  // finds and returns component for node
  component: function (node) {
    if (node.getAttribute('data-ui')) {
      return node;
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.component(next);
    }
  },

  // finds and returns scope for node
  scope: function (node) {
    if (node.getAttribute('data-scope')) {
      return node;
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.scope(next);
    }
  },

  // returns the name of the scope for node
  scopeName: function (node) {
    if (node.getAttribute('data-scope')) {
      return node.getAttribute('data-scope');
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.scopeName(next);
    }
  },

  // finds and returns prop for node
  prop: function (node) {
    if (node.getAttribute('data-prop')) {
      return node;
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.prop(next);
    }
  },

  // returns the name of the prop for node
  propName: function (node) {
    if (node.getAttribute('data-prop')) {
      return node.getAttribute('data-prop');
    }

    var next = node.parentNode;
    if (next && next !== document) {
      return pw.node.propName(next);
    }
  },

  // returns the name of the version for node
  versionName: function (node) {
    if (node.hasAttribute('data-version')) {
      return node.getAttribute('data-version');
    }
  },

  // creates a context in which view manipulations can occur
  invoke: function(node, cb) {
    cb.call(node);
  },

  invokeWithData: function(node, data, cb) {
    if (pw.node.isNodeList(node)) {
      node = pw.node.toA(node);
    }

    node = Array.ensure(node);
    data = Array.ensure(data);

    node.forEach(function (e, i) {
      cb.call(e, data[i]);
    });
  },

  match: function(node, data) {
    if (pw.node.isNodeList(node)) {
      node = pw.node.toA(node);
    }

    node = Array.ensure(node);
    data = Array.ensure(data);

    var collection = data.reduce(function (c, dm, i) {
      // get the view, or if we're out just use the last one
      var v = n[i] || n[n.length - 1];

      var dv = v.cloneNode(true);
      v.parentNode.insertBefore(dv);
      return c.concat([dv])
    }, []);

    node.forEach(function (o) {
      o.parentNode.removeChild(o);
    });

    return collection;
  },

  repeat: function(node, data, cb) {
    pw.node.invokeWithData(pw.node.match(node, data), data, cb);
  },

  // binds an object to a node
  bind: function (data, node, cb) {
    var scope = pw.node.findBindings(node)[0];

    pw.node.invokeWithData(node, data, function(dm) {
      if (!dm) {
        return;
      }

      if(dm.id) {
        this.setAttribute('data-id', dm.id);
      }

      pw.node.bindDataToScope(dm, scope, node);

      if(!(typeof cb === 'undefined')) {
        cb.call(this, dm);
      }
    });
  },

  apply: function (data, node, cb) {
    var c = pw.node.match(node, data);
    pw.node.bind(data, c, cb);
    return c;
  },

  findBindings: function (node) {
    var bindings = [];
    pw.node.breadthFirst(node, function() {
      var o = this;

      var scope = o.getAttribute('data-scope');

      if(!scope) {
        return;
      }

      var props = [];
      pw.node.breadthFirst(o, function() {
        var so = this;

        // don't go into deeper scopes
        if(o != so && so.getAttribute('data-scope')) {
          return;
        }

        var prop = so.getAttribute('data-prop');

        if(!prop) {
          return;
        }

        props.push({
          prop: prop,
          doc: so
        });
      });

      bindings.push({
        scope: scope,
        props: props,
        doc: o,
      });
    });

    return bindings;
  },

  bindDataToScope: function (data, scope, node) {
    if(!data || !scope) {
      return;
    }

    scope['props'].forEach(function (p) {
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
    });
  },

  bindAttributesToNode: function (attrs, node) {
    var nAtrs = pw.attrs.init(pw.view.init(node));

    for(var attr in attrs) {
      var v = attrs[attr];
      if(typeof v === 'function') {
        v = v.call(node.getAttribute(attr));
      }

      if (v) {
        if (v instanceof Array) {
          v.forEach(function (attrInstruction) {
            nAtrs[attrInstruction[0]](attr, attrInstruction[1]);
          });
        } else {
          nAtrs.set(attr, v);
        }
      } else {
        nAtrs.remove(attr);
      }
    }
  },

  bindValueToNode: function (value, node) {
    if(pw.node.isTagWithoutValue(node)) {
      return;
    }

    //TODO handle other form fields (port from pakyow-presenter)
    if (node.tagName === 'INPUT' && node.type === 'checkbox') {
      if (value === true || (node.value && value === node.value)) {
        node.checked = true;
      } else {
        node.checked = false;
      }
    } else if (node.tagName === 'TEXTAREA' || pw.node.isSelfClosingTag(node)) {
      node.value = value;
    } else {
      if (value) {
        node.innerHTML = value;
      }
    }
  },

  isTagWithoutValue: function(node) {
    return valuelessTags.indexOf(node.tagName) != -1 ? true : false;
  },

  isSelfClosingTag: function(node) {
    return selfClosingTags.indexOf(node.tagName) != -1 ? true : false;
  },

  breadthFirst: function (node, cb) {
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
  },

  isNodeList: function(nodes) {
    return typeof nodes.length !== 'undefined';
  },

  byAttr: function (node, attr, value) {
    return pw.node.all(node).filter(function (o) {
      var ov = o.getAttribute(attr);
      return ov !== null && ((typeof value) === 'undefined' || ov == value);
    });
  },

  setAttr: function (node, attr, value) {
    if (attr === 'style') {
      value.pairs().forEach(function (kv) {
        node.style[kv[0]] = kv[1];
      });
    } else {
      if (attr === 'class') {
        value = value.join(' ');
      }

      if (attr === 'checked') {
        if (value) {
          value = 'checked';
        } else {
          value = '';
        }

        node.checked = value;
      }

      node.setAttribute(attr, value);
    }
  },

  all: function (node) {
    var arr = [];

    if (!node) {
      return arr;
    }

    if(document !== node) {
      arr.push(node);
    }

    return arr.concat(pw.node.toA(node.getElementsByTagName('*')));
  },

  before: function (node, newNode) {
    node.parentNode.insertBefore(newNode, node);
  },

  after: function (node, newNode) {
    node.parentNode.insertBefore(newNode, this.nextSibling);
  },

  replace: function (node, newNode) {
    node.parentNode.replaceChild(newNode, node);
  },

  append: function (node, newNode) {
    node.appendChild(newNode);
  },

  prepend: function (node, newNode) {
    node.insertBefore(newNode, node.firstChild);
  },

  remove: function (node) {
    node.parentNode.removeChild(node);
  },

  clear: function (node) {
    while (node.firstChild) {
      pw.node.remove(node.firstChild);
    }
  },

  title: function (node, value) {
    var titleNode;
    if (titleNode = node.getElementsByTagName('title')[0]) {
      titleNode.innerText = value;
    }
  },

  toA: function (nodeSet) {
    return Array.prototype.slice.call(nodeSet);
  },

  serialize: function (node) {
    var json = {};
    var working;
    var value;
    var split, last;
    var previous, previous_name;
    node.querySelectorAll('input, select, textarea').forEach(function (input) {
      working = json;
      split = input.name.split('[');
      last = split[split.length - 1];
      split.forEach(function (name) {
        value = pw.node.value(input);

        if (name == ']') {
          if (!(previous[previous_name] instanceof Array)) {
            previous[previous_name] = [];
          }

          if (value) {
            previous[previous_name].push(value);
          }
        }

        if (name != last) {
          value = {};
        }

        name = name.replace(']', '');

        if (name == '' || name == '_method') {
          return;
        }

        if (!working[name]) {
          working[name] = value;
        }

        previous = working;
        previous_name = name;
        working = working[name];
      });
    });

    return json;
  }
};
