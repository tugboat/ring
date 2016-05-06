pw.instruct = {
  process: function (collection, packet, socket) {
    if (collection.length() === 1 && collection.views[0].node.getAttribute('data-version') === 'empty') {
      pw.instruct.fetchView(packet, socket, collection.views[0].node);
    } else {
      pw.instruct.perform(collection, packet.payload);
    }
  },

  fetchView: function (packet, socket, node) {
    socket.fetchView({ channel: packet.channel }, function (view) {
      if (view) {
        var parent = node.parentNode;
        parent.replaceChild(view.node, node);

        var selector = '*[data-channel="' + packet.channel + '"]';
        var nodes = pw.node.toA(parent.querySelectorAll(selector));
        pw.instruct.perform(pw.collection.fromNodes(nodes, selector), packet.payload);
      } else {
        console.log('trouble fetching view :(');
      }
    });
  },

  // TODO: make this smart and cache results, invalidating
  // if the websocket connection reconnects (since that means
  // the server probably restarted)
  template: function (view, cb) {
    var lookup = {};

    if (!view || !view.first()) {
      return cb();
    }

    var node = view.first().node;

    if (node.hasAttribute('data-channel')) {
      lookup.channel = view.first().node.getAttribute('data-channel');
    } else if (node.hasAttribute('data-ui') && node.hasAttribute('data-scope')) {
      lookup.component = pw.node.component(node).getAttribute('data-ui');
      lookup.scope = node.getAttribute('data-scope');
    } else {
      cb();
      return;
    }

    window.socket.fetchView(lookup, function (view) {
      cb(view);
    });
  },

  perform: function (collection, instructions, cb) {
    var self = this;
    instructions = instructions || [];

    function instruct (subject, instruction) {
      var method = instruction[0];
      var value = instruction[1];
      var nested = instruction[2];

      // remap instructions to the ring name
      if (method === 'with') {
        method = 'invoke';
      }

      if (method === 'for') {
        method = 'invokeWithData';
      }

      if (collection[method]) {
        if (method == 'invoke' || method == 'invokeWithData' || method == 'bind' || method == 'repeat' || method == 'apply' || method == 'version') {
          var cbLength = collection.length();
          var cbCount = 0;
          var nestedCb = function () {
            cbCount++;

            if (cbCount == cbLength) {
              next();
            }
          }
          collection.setEndpoint(self)[method].call(collection, value, function (datum) {
            pw.instruct.perform(this, nested[value.indexOf(datum)], nestedCb);
          });
          return;
        } else if (method == 'attrs') {
          self.performAttr(collection.attrs(), nested);
          next();
          return;
        } else if (method == 'use') {
          collection.setEndpoint(self);
          collection.use(value, next);
          return;
        } else {
          var mutatedViews = collection[method].call(collection, value);
        }
      } else {
        console.log('could not find method named: ' + method);
        return;
      }

      if (nested instanceof Array) {
        pw.instruct.perform(mutatedViews, nested, next);
        return;
      } else if (mutatedViews) {
        collection = mutatedViews;
      }

      next();
    };

    var i = 0;
    function next() {
      if (i < instructions.length) {
        instruct(collection, instructions[i++]);
      } else {
        done();
      }
    };

    function done() {
      if (cb) {
        cb();
      } else {
        pw.component.findAndInit(collection.node);
      }
    };

    next();
  },

  performAttr: function (context, attrInstructions) {
    attrInstructions.forEach(function (attrInstruct) {
      var attr = attrInstruct[0];
      var value = attrInstruct[1];
      var nested = attrInstruct[2];

      if (value) {
        context.set(attr, value);
      } else {
        context[nested[0][0]](attr, nested[0][1]);
      }
    });
  }
};
