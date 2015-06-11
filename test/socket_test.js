var helper = require('../test/support/test_helper');
var expect = helper.expect;

require('../src/core/init');
require('../src/core/socket');

WebSocket = function (url) {
  this.url = url;
};

describe('pw.socket', function () {
  describe('initialize', function () {
    describe('when passed a host, port, protocol, and connId', function () {
      it('initializes a websocket with the proper url', function () {
        var socket = pw.socket.init({
          host: 'localhost',
          port: '3000',
          protocol: 'https:',
          connId: '123'
        });

        expect(socket.ws.url).to.equal('wss://localhost:3000/?socket_connection_id=123');
      });
    });

    describe('when not passed a host, port, protocol, or connId', function () {
      it('pulls the information from the environment');
    });
  });

  describe('send', function () {
    it('sends the message through the websocket');
    it('mixes in a message id');
  });

  describe('message', function () {
    describe('and the channel is directed at a component', function () {
      it('sends the message to the component');
    });

    it('creates an instruct context with channel nodes and payload');
  });

  describe('reconnect', function () {
    it('calculates the time to wait');
    it('calls init after the wait time');
  });

  describe('having established the websocket connection', function () {
    describe('and a connection callback was passed', function () {
      it('calls the callback with the socket');
    });

    describe('and a connection callback was not passed', function () {
      it('succeeds');
    });
  });

  describe('when the websocket connection closes', function () {
    it('triggers a reconnect');
  });

  describe('receiving a message', function () {
    describe('that is a response to a send', function () {
      it('calls the callback registered when sending');
    });

    describe('that is not a response to a send', function () {
      it('calls the default message handler');
    });
  });
});
