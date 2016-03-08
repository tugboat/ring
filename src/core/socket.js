/*
  Socket init.
*/

pw.init.register(function () {
  pw.socket.init({
    cb: function (socket) {
      window.socket = socket;
      pw.component.broadcast('socket:available');
    }
  });
});

/*
  Socket related functions.
*/

pw.socket = {
  init: function (options) {
    return pw.socket.connect(
      options.host,
      options.port,
      options.protocol,
      options.connId,
      options.cb
    );
  },

  connect: function (host, port, protocol, connId, cb) {
    if(typeof host === 'undefined') host = window.location.hostname;
    if(typeof port === 'undefined') port = window.location.port;
    if(typeof protocol === 'undefined') protocol = window.location.protocol;
    if(typeof connId === 'undefined') connId = document.getElementsByTagName('body')[0].getAttribute('data-socket-connection-id');

    if (!connId) {
      return;
    }

    var wsUrl = '';

    if (protocol === 'http:') {
      wsUrl += 'ws://';
    } else if (protocol === 'https:') {
      wsUrl += 'wss://';
    }

    wsUrl += host;

    if (port) {
      wsUrl += ':' + port;
    }

    wsUrl += '/?socket_connection_id=' + connId;

    return new pw_Socket(wsUrl, cb);
  }
};

var pw_Socket = function (url, cb) {
  var self = this;

  this.callbacks = {};

  this.url = url;
  this.initCb = cb;

  this.ws = new WebSocket(url);

  this.id = url.split('socket_connection_id=')[1];

  var pingInterval;

  this.ws.onmessage = function (evt) {
    pw.component.broadcast('socket:loaded');

    var data = JSON.parse(evt.data);
    if (data.id) {
      var cb = self.callbacks[data.id];
      if (cb) {
        cb.call(this, data);
        return;
      }
    }

    self.message(data);
  };

  this.ws.onclose = function (evt) {
    console.log('socket closed');
    clearInterval(pingInterval);
    self.reconnect();
  };

  this.ws.onopen = function (evt) {
    console.log('socket open');

    if(self.initCb) {
      self.initCb(self);
    }

    pingInterval = setInterval(function () {
      self.send({ action: 'ping' });
    }, 30000);
  }
};

pw_Socket.prototype = {
  send: function (message, cb) {
    pw.component.broadcast('socket:loading');

    message.id = pw.util.guid();
    if (!message.input) {
      message.input = {};
    }
    message.input.socket_connection_id = this.id;
    this.callbacks[message.id] = cb;
    this.ws.send(JSON.stringify(message));
  },

  //TODO handle custom messages (e.g. not pakyow specific)
  message: function (packet) {
    console.log('received message');
    console.log(packet);

    var selector = '*[data-channel="' + packet.channel + '"]';

    if (packet.channel && packet.channel.split(':')[0] === 'component') {
      pw.component.push(packet);
      return;
    }

    var nodes = pw.node.toA(document.querySelectorAll(selector));

    if (nodes.length === 0) {
      //TODO decide how to handle this condition; there are times where this
      // is going to be the case and not an error; at one point we were simply
      // reloading the page, but that doesn't work in all cases
      return;
    }

    pw.instruct.process(pw.collection.fromNodes(nodes, selector), packet, this);
  },

  reconnect: function () {
    var self = this;

    if (!self.wait) {
      self.wait = 100;
    } else {
      self.wait *= 1.25;
    }

    console.log('reconnecting socket in ' + self.wait + 'ms');

    setTimeout(function () {
      pw.socket.init({ cb: self.initCb });
    }, self.wait);
  },

  fetchView: function (lookup, cb) {
    var uri;

    if (window.location.hash) {
      var arr = window.location.hash.split('#:')[1].split('/');
      arr.shift();
      uri = arr.join('/');
    } else {
      uri = window.location.pathname + window.location.search;
    }

    this.send({
      action: 'fetch-view',
      lookup: lookup,
      uri: uri
    }, function (res) {
      var view = pw.view.fromStr(res.body);

      if (view.node) {
        view.node.removeAttribute('data-id');
        cb(view);
      } else {
        cb();
      }
    });
  }
};
