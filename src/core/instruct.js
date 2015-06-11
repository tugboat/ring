pw.instruct = {};

pw.instruct.process = function (collection, packet, socket) {
  if (collection.length() === 1 && collection.views[0].node.getAttribute('data-version') === 'empty') {
    pw.instruct.fetchView(packet, socket, collection.views[0].node);
  } else {
    pw.instruct.perform(collection, packet.payload);
  }
};

pw.instruct.fetchView = function (packet, socket, node) {
  socket.fetchView(packet.channel, function (view) {
    var parent = node.parentNode;
    parent.replaceChild(view.node, node);

    var selector = '*[data-channel="' + packet.channel + '"]';
    var nodes = parent.querySelectorAll(selector);
    pw.instruct.perform(pw.collection.fromNodes(nodes, selector), packet.payload);
  });
};

pw.instruct.perform = function (collection, instructions) {
  var self = this;

  _.each(instructions, function (instruction, i) {
    var method = instruction[0];
    var value = instruction[1];
    var nested = instruction[2];

    if (collection[method]) {
      if (method == 'with' || method == 'for' || method == 'bind' || method == 'repeat' || method == 'apply') {
        collection[method].call(collection, value, function (datum) {
          pw.instruct.perform(this, nested);
        });
        return;
      } else if (method == 'attrs') {
        self.performAttr(collection.attrs(), nested);
        return;
      } else {
        var mutatedViews = collection[method].call(collection, value);
      }
    } else {
      console.log('could not find method named: ' + method);
      return;
    }

    if (nested instanceof Array) {
      pw.instruct.perform(mutatedViews, nested);
    } else if (mutatedViews) {
      collection = mutatedViews;
    }
  });
};

pw.instruct.performAttr = function (context, attrInstructions) {
  _.each(attrInstructions, function (attrInstruct) {
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
