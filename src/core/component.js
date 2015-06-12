/*
  Component init.
*/

pw.init.register(function () {
  pw.component.findAndInit(document.querySelectorAll('body')[0]);
});

/*
  Component related functions.
*/

pw.component = {};

pw.component.init = function (view, config) {
  return new pw_Component(view, config);
};

// stores component functions by name
var components = {};

// stores component instances by channel
var channelComponents = {};

pw.component.resetChannels = function () {
  channelComponents = {};
};

pw.component.findAndInit = function (node) {
  pw.component.resetChannels();

  _.each(pw.node.byAttr(node, 'data-ui'), function (uiNode) {
    var name = uiNode.getAttribute('data-ui');
    var cfn = components[name];

    var channel = uiNode.getAttribute('data-channel');
    var config = uiNode.getAttribute('data-config');
    var view = pw.view.init(uiNode);

    if (cfn) {
      var component = new cfn(view, pw.component.buildConfigObject(config));
      component.config = config;
      component.view = view;

      pw.component.registerForChannel(component, channel);
    } else {
      var component = new pw.component.init(view, pw.component.buildConfigObject(config));
      pw.component.registerForChannel(component, channel);
    }
  });
}

pw.component.push = function (packet) {
  _.each(channelComponents[packet.channel], function (component) {
    if (packet.payload.instruct) {
      component.instruct(packet.channel, packet.payload.instruct);
    } else {
      component.message(packet.channel, packet.payload);
    }
  });
}

pw.component.register = function (name, fn) {
  fn.prototype.listen    = pw_Component.prototype.listen;
  fn.prototype.broadcast = pw_Component.prototype.broadcast;
  fn.prototype.instruct  = pw_Component.prototype.instruct;
  components[name] = fn;
}

pw.component.buildConfigObject = function(configString) {
  var confObj = {};

  if (configString != null) {
    var pairs = configString.split(";");
    for(var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].trim().split(":");
      confObj[kv[0].trim()] = kv[1].trim();
    }
  }

  return confObj;
};

pw.component.registerForChannel = function (component, channel) {
  // store component instance by channel for messaging
  if (!channelComponents[channel]) {
    channelComponents[channel] = [];
  }

  channelComponents[channel].push(component);
};

/*
  pw_Component makes it possible to build custom controls.
*/

var pw_Component = function (view, config) {
  this.view = view;
  this.config = config;
}

pw_Component.prototype.listen = function (channel) {
  pw.component.registerForChannel(this, channel);
};

pw_Component.prototype.broadcast = function (payload, channel) {
  pw.component.push({ payload: payload, channel: channel });
};

pw_Component.prototype.instruct = function (channel, instructions) {
  var packet = {
    payload: instructions,
    channel: channel
  };

  pw.instruct.process(pw.collection.init(this.view), packet, window.socket);
};

pw_Component.prototype.message = function (channel, payload) {
};
