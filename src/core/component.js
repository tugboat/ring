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

pw.component = {
  init: function (view, config) {
    return new pw_Component(view, config);
  },

  resetChannels: function () {
    channelComponents = {};
  },

  findAndInit: function (node) {
    pw.component.resetChannels();

    pw.node.byAttr(node, 'data-ui').forEach(function (uiNode) {
      var name = uiNode.getAttribute('data-ui');
      var cfn = components[name] || pw.component.init;

      var channel = uiNode.getAttribute('data-channel');
      var config = uiNode.getAttribute('data-config');
      var view = pw.view.init(uiNode);

      var component = new cfn(view, pw.component.buildConfigObject(config));
      component.config = config;
      component.view = view;

      pw.component.registerForChannel(component, channel);
    });
  },

  push: function (packet) {
    var channel = packet.channel;
    var instruct = packet.instruct;
    var payload = packet.payload;

    (channelComponents[channel] || []).forEach(function (component) {
      if (instruct) {
        component.instruct(channel, instruct);
      } else {
        component.message(channel, payload);
      }
    });
  },

  register: function (name, fn) {
    ['listen', 'broadcast', 'instruct'].forEach(function (method) {
      fn.prototype[method] = pw_Component.prototype[method];
    });

    components[name] = fn;
  },

  buildConfigObject: function(configString) {
    if (!configString) {
      return {};
    }

    return configString.split(';').reduce(function (config, option) {
      var kv = option.trim().split(':');
      console.log(kv)
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
  }
};

/*
  pw_Component makes it possible to build custom controls.
*/

var pw_Component = function (view, config) {
  this.view = view;
  this.config = config;
}

pw_Component.prototype = {
  listen: function (channel) {
    pw.component.registerForChannel(this, channel);
  },

  broadcast: function (payload, channel) {
    pw.component.push({ payload: payload, channel: channel });
  },

  instruct: function (channel, instructions) {
    var packet = {
      payload: instructions,
      channel: channel
    };

    pw.instruct.process(pw.collection.init(this.view), packet, window.socket);
  },

  message: function (channel, payload) {}
};
