/*
  Component init.
*/

pw.init.register(function () {
  pw.component.findAndInit(document.querySelectorAll('body')[0]);
});

/*
  Component related functions.
*/

// stores component functions by name
var components = {};

// stores component instances by channel
var channelComponents = {};
var channelBroadcasts = {};

// component instances
var componentInstances = {};

pw.component = {
  init: function (view, config) {
    return new pw_Component(view, config);
  },

  resetChannels: function () {
    channelComponents = {};
  },

  findAndInit: function (node) {
    pw.node.byAttr(node, 'data-ui').forEach(function (uiNode) {
      if (uiNode._ui) {
        return;
      }

      var name = uiNode.getAttribute('data-ui');
      var cfn = components[name] || pw.component.init;

      if (!componentInstances[name]) {
        componentInstances[name] = [];
      }

      var channel = uiNode.getAttribute('data-channel');
      var config = uiNode.getAttribute('data-config');
      var view = pw.view.init(uiNode);
      var id = componentInstances[name].length;

      var component = new cfn(view, pw.component.buildConfigObject(config), name, id);
      component.init(view, config, name);

      pw.component.registerForChannel(component, channel);
      componentInstances[name].push(component);

      uiNode._ui = true;
    });
  },

  push: function (packet) {
    var channel = packet.channel;
    var payload = packet.payload;
    var instruct = payload.instruct;

    (channelComponents[channel] || []).forEach(function (component) {
      if (instruct) {
        component.instruct(channel, instruct);
      } else {
        component.message(channel, payload);
      }
    });
  },

  register: function (name, fn) {
    var proto = pw_Component.prototype;

    Object.getOwnPropertyNames(proto).forEach(function (method) {
      fn.prototype[method] = proto[method];
    });

    components[name] = fn;
  },

  buildConfigObject: function(configString) {
    if (!configString) {
      return {};
    }

    return configString.split(';').reduce(function (config, option) {
      var kv = option.trim().split(':');
      config[kv[0].trim()] = kv[1].trim();
      return config;
    }, {});
  },

  registerForChannel: function (component, channel) {
    // store component instance by channel for messaging
    if (!channelComponents[channel]) {
      channelComponents[channel] = [];
    }

    channelComponents[channel].push(component);
  },

  registerForBroadcast: function (channel, cb, component) {
    if (!channelBroadcasts[channel]) {
      channelBroadcasts[channel] = [];
    }

    channelBroadcasts[channel].push([cb, component]);
  },

  deregisterForBroadcast: function (channel, component) {
    var components = channelBroadcasts[channel];

    var instanceTuple = components.find(function (tuple) {
      return tuple[1] == component;
    });

    var i = components.indexOf(instanceTuple);
    components.splice(i, 1);
  },

  broadcast: function (channel, payload) {
    (channelBroadcasts[channel] || []).forEach(function (cbTuple) {
      cbTuple[0].call(cbTuple[1], payload);
    });
  }
};

/*
  pw_Component makes it possible to build custom controls.
*/

var pw_Component = function (view, config, name) {
  // placeholder
};

pw_Component.prototype = {
  init: function (view, config, name) {
    var node = view.node;
    this.view = view;
    this.node = node;
    this.config = config;
    this.name = name;
    this.templates = {};
    var self = this;

    // setup templates
    pw.node.toA(node.querySelectorAll(':scope > *[data-template]')).forEach(function (templateNode) {
      var cloned = templateNode.cloneNode(true);
      pw.node.remove(templateNode);

      var scope = cloned.getAttribute('data-scope');

      if (this.templates[scope]) {
        this.templates[scope].views.push(pw.view.init(cloned));
      } else {
        this.templates[scope] = pw.collection.init(pw.view.init(cloned));
      }

      cloned.removeAttribute('data-template');
    }, this);

    // setup our initial state
    this.state = pw.state.init(this.node);

    // register as a dependent to the parent component
    if (this.dCb) {
      var parentComponent = pw.node.component(this.node.parentNode);

      if (parentComponent) {
        parentComponent.addEventListener('mutated', function (evt) {
          self.transform(self.dCb(evt.target._evtData));
        });

        self.transform(self.dCb(pw.state.init(parentComponent).current()));
      }
    }

    // make it mutable
    var mutableCb = function (evt) {
      var scope = pw.node.scope(evt.target);

      if (scope) {
        evt.preventDefault();
        self.mutated(scope);
      }
    };

    node.addEventListener('submit', mutableCb);
    node.addEventListener('change', function (evt) {
      if (!pw.node.inForm(evt.target)) {
        mutableCb(evt);
      }
    });

    //TODO define other mutable things

    if (this.inited) {
      this.inited();
    }
  },

  listen: function (channel, cb) {
    pw.component.registerForBroadcast(channel, cb, this);
  },

  ignore: function (channel) {
    pw.component.deregisterForBroadcast(channel, this);
  },

  // Bubbles an event up to a parent component. Intended to be used
  // as an alternative to `broadcast` in cases where child components
  // have an impact on their parents.
  bubble: function (channel, payload) {
    var parentComponent = pw.node.component(this.node.parentNode);

    (channelBroadcasts[channel] || []).forEach(function (cbTuple) {
      if (cbTuple[1].node == parentComponent) {
        cbTuple[0].call(cbTuple[1], payload);
      }
    });
  },

  // Trickles an event down to child components. Intended to be used
  // as an alternative to `broadcast` in cases where parent components
  // have an impact on their children.
  trickle: function (channel, payload) {
    var channels = (channelBroadcasts[channel] || []);
    pw.node.toA(this.node.getElementsByTagName('*')).forEach(function (node) {
      channels.forEach(function (cbTuple) {
        if (cbTuple[1].node == node) {
          cbTuple[0].call(cbTuple[1], payload);
        }
      });
    })
  },

  //TODO this is pretty similary to processing instructions
  // for views in that we also have to handle the empty case
  //
  // there might be an opportunity for some refactoring
  instruct: function (channel, instructions) {
    this.endpoint = pw.instruct;

    var current = this.state.current();
    if (current.length === 1) {
      var view = this.view.scope(current[0].scope);
      var node = view.views[0].node;
      if (node.getAttribute('data-version') === 'empty') {
        var self = this;
        pw.instruct.template(view, function (rview) {
          var parent = node.parentNode;
          parent.replaceChild(rview.node, node);

          instructions.forEach(function (instruction) {
            self[instruction[0]](instruction[1]);
          });
        });

        return;
      }
    }

    instructions.forEach(function (instruction) {
      this[instruction[0]](instruction[1]);
    }, this);
  },

  message: function (channel, payload) {
    // placeholder
  },

  mutated: function (node) {
    this.mutation(this.state.diffNode(node));
    this.state.update();

    pw.node.trigger('mutated', this.node, this.state.current());
  },

  mutation: function (mutation) {
    // placeholder
  },

  transform: function (state) {
    this._transform(state);
  },

  _transform: function (state) {
    if (!state) {
      return;
    }

    if (state.length > 0) {
      this.view.scope(state[0].scope).setEndpoint(this.endpoint || this).apply(state);
    } else {
      pw.node.breadthFirst(this.view.node, function () {
        if (this.hasAttribute('data-scope')) {
          pw.node.remove(this);
        }
      });
    }

    pw.node.trigger('mutated', this.node, this.state.current());
  },

  revert: function () {
    this.transform(this.state.revert());
  },

  rollback: function () {
    this.transform(this.state.rollback());
  },

  template: function (view, cb) {
    var template;

    if (template = this.templates[view.scope]) {
      cb(template);
    }
  },

  remove: function (data) {
    this.state.remove(data);
    this.transform(this.state.current());
  },

  append: function (data) {
    this.state.append(data);
    this.transform(this.state.current());
  },

  prepend: function (data) {
    this.state.prepend(data);
    this.transform(this.state.current());
  },

  parent: function () {
    var parent = pw.node.scope(this.node);

    if (parent) {
      return pw.state.init(parent).current()[0];
    }
  },

  dependent: function (cb) {
    this.dCb = cb;
  }
};
