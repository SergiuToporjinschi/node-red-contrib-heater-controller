var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require("./testHelper.js");
var WS = require('../nodes/heater/webSocketServer');
describe('webSocketServer', function () {

    it('Constructor default settings', function (done) {
        RED = helper.getMockedRED();
        RED.server.on = sinon.fake();
        var ws = new WS(RED, 12345);
        should(ws).not.be.undefined('Constructor failed!!!');
        should(RED.server.on.callCount).be.equal(1, 'Upgrade not called');
        should(RED.server.on.firstCall.args[0]).be.equal('upgrade', 'Upgrade not called');
        should(RED.server.on.firstCall.args[1]).be.type('function', 'Upgrade not called with a callback function');
        done();
    });

    it('Constructor custom settings', function (done) {
        RED = helper.getMockedRED();
        RED.server.on = sinon.fake();
        RED.settings.httpNodeRoot = '/node-red';
        var ws = new WS(RED, 12345);
        should(ws).not.be.undefined('Constructor failed!!!');
        should(RED.server.on.callCount).be.equal(1, 'Upgrade not called');
        should(RED.server.on.firstCall.args[0]).be.equal('upgrade', 'Upgrade not called');
        should(RED.server.on.firstCall.args[1]).be.type('function', 'Upgrade not called with a callback function');
        done();
    });

    describe('Test methods', function () {
        var ws;
        beforeEach(() => {
            RED = helper.getMockedRED();
            RED.server.on = sinon.fake();
            RED.settings.httpNodeRoot = 'node-red';
            ws = new WS(RED, 12345);
        });
        it('Test start', function (done) {
            var serverURL = ws.start();
            should(serverURL).be.equal('node-red/heaterController/io/12345', 'Invalid server url');
            done();
        });

        it('Test shutdownServer', function (done) {
            ws.start();
            ws.shutdownServer();
            done();
        });

        itParam('Test registerIncomingEvents: throws exception', [
            { topic: undefined, func: undefined, scope: undefined },
            { topic: undefined, func: 2, scope: undefined },
            { topic: 2, func: undefined, scope: undefined },
            { topic: 'trigger', func: undefined, scope: undefined },
            { topic: 2, func: function () { }, scope: undefined },
            { topic: undefined, func: function () { }, scope: undefined }
        ], function (val) {
            should(function () { ws.registerIncomingEvents(val); }).throw('Invalid arguments [topic:string, func:function]');
        });

        it('Test registerIncomingEvents and _triggerEvent: event is triggered', function (done) {
            var eventCB = sinon.fake();
            var scopeFunc = sinon.fake();
            var socketObj = { id: 'socketObj' };
            ws.registerIncomingEvents('topicEvent', eventCB, scopeFunc);
            ws._triggerEvent('topicEvent', 'msg', socketObj);
            should(eventCB.callCount).be.equal(1, 'Event not triggered!!!');
            should(eventCB.lastCall.args[0]).be.equal('msg', 'Invalid message for event execution');
            should(eventCB.lastCall.args[1]).be.deepEqual(socketObj, 'Invalid socket for event execution');
            done();
        });

        it('Test _onClientConnected: event is triggered', function (done) {
            var eventCB = sinon.fake();
            var scopeFunc = sinon.fake();
            var socketObj = { id: 'socketObj' };
            ws.registerIncomingEvents('connection', eventCB, scopeFunc);
            ws._onClientConnected(socketObj);
            should(eventCB.callCount).be.equal(1, 'Event not triggered!!!');
            should(eventCB.lastCall.args[0]).be.undefined('Unexpected message injection');
            should(eventCB.lastCall.args[1]).be.deepEqual(socketObj, 'Invalid socket for event execution');
            done();
        });

        itParam('Test _encodedMessage: throw error', [
            { topic: undefined, message: undefined },
            { topic: undefined, message: () => { } },
            { topic: 2, message: () => { } },
            { topic: 2, message: undefined },
            { topic: 'testTopic', message: undefined },
            { topic: 'testTopic', message: () => { } }
        ], function (val) {
            should(function () {
                ws._encodedMessage(val.topic, val.message);
            }).throw('Invalid arguments [topic:string, message:!(undefined|function)]', 'Accepts invalid message for encoding');
        });

        itParam('Test _encodedMessage: throw error', [
            { topic: undefined, message: undefined },
            { topic: undefined, message: () => { } },
            { topic: 2, message: () => { } },
            { topic: 2, message: undefined },
            { topic: 'testTopic', message: undefined },
            { topic: 'testTopic', message: () => { } }
        ], function (val) {
            should(function () {
                ws._encodedMessage(val.topic, val.message);
            }).throw('Invalid arguments [topic:string, message:!(undefined|function)]', 'Accepts invalid message for encoding');
        });

        it('Test _encodedMessage: encodes messages', function (done) {
            var encodedMessage = ws._encodedMessage('testTopic', { id: 'messageToSend' });
            should(encodedMessage).be.String('Encoded messages should be string');
            should(JSON.parse(encodedMessage)).be.deepEqual({ topic: 'testTopic', payload: { id: 'messageToSend' } }, 'Invalid encoded message');
            done();
        });

        itParam('Test _decodeMessage: throw error', [2, undefined, {}], function (val) {
            should(function () {
                ws._decodeMessage(val);
            }).throw('Invalid message!!!', 'Should throw exception for invalid message');
        });

        itParam('Test _decodeMessage: throw error', ['{invalidJson}'], function (val) {
            should(function () {
                ws._decodeMessage(val);
            }).throw('Could not decode message: Unexpected token i in JSON at position 1', 'Should throw exception for invalid json message');
        });

        itParam('Test _decodeMessage: throw error', ['{"t":2,"a":2}', '{"topic":2,"a":2}'], function (val) {
            should(function () {
                ws._decodeMessage(val);
            }).throw('Invalid message!!!', 'Should throw exception for invalid message after decoding');
        });

        itParam('Test _decodeMessage: decode valid message', [
            '{"topic":"testTopic","payload":"aStringPayload"}',
            '{"topic":"testTopic","payload":{"id":"payloadMessage"}}'
        ], function (val) {
            var ret = ws._decodeMessage(val);
            should(ret).be.Object('Decode message should be an object');
            should(ret).be.deepEqual(JSON.parse(val), 'Decoded message not matching with input message');
        });

        it('Test send: throw exception', function (done) {
            ws.broadcast = sinon.fake();
            should(() => {
                ws.send();
            }).throw('Invalid topic on send command', 'Should not be able to send message without an valid topic');
            done();
        });

        itParam('Test send: messingTopic should broad cast message', [{ topic: 'topic', message: 'test' }, { topic: 'topic' }], function (val) {
            ws.broadcast = sinon.fake();
            ws.send(val.topic, val.message, val.webSocket);
            should(ws.broadcast.callCount).be.equal(1, 'Message should be broadcasted if there is not socket');
            should(ws.broadcast.lastCall.args[0]).be.equal(val.topic, 'Invalid topic for broadcasted message');
            should(ws.broadcast.lastCall.args[1]).be.deepEqual(val.message, 'Invalid payload for broadcasted message');
        });

        it('Test send: should send message', function (done) {
            ws.broadcast = sinon.fake();
            var fakeSend = sinon.fake();
            ws.send('topic', 'message', { send: fakeSend });
            should(fakeSend.callCount).be.equal(1, 'Message should be broadcasted if there is not socket');
            should(fakeSend.lastCall.args[0]).be.String('Invalid message to be send');
            done();
        });

        it('Test _onReceivedMessage: decode and trigger event', function (done) {
            ws.broadcast = sinon.fake();
            var fakeSend = sinon.fake();

            var eventCB = sinon.fake();
            var scopeFunc = sinon.fake();
            var socketObj = { id: 'socketObj' };
            ws.registerIncomingEvents('testEvent', eventCB, scopeFunc);

            ws._onReceivedMessage({ send: fakeSend }, JSON.stringify({ topic: 'testEvent', payload: 'payload' }));
            should(eventCB.callCount).be.equal(1, 'Event not triggered when a new message arrives');
            should(eventCB.firstCall.args[0]).be.equal('payload', 'Event not triggered with payload');
            should(eventCB.firstCall.args[1]).be.deepEqual({ send: fakeSend }, 'Event function not triggered with the socket instance');
            done();
        });

        // it('Test _handleServerUpgrade: event is triggered only once', function (done) {
        //     RED = helper.getMockedRED();
        //     RED.server.on = sinon.fake();
        //     RED.settings.httpNodeRoot = 'node-red';
        //     var ws = new WS(RED, 12345);
        //     var req = { id: 'test' };
        //     var socketObj = { id: 'socketObj' };
        //     var headObj = { id: 'head' };
        //     ws._handleServerUpgrade(req, socketObj, headObj);
        //     ws.#server
        //     should(eventCB.callCount).be.equal(1, 'Event not triggered!!!');
        //     should(eventCB.lastCall.args[0]).be.equal('msg', 'Invalid message for event execution');
        //     should(eventCB.lastCall.args[1]).be.deepEqual(socketObj, 'Invalid socket for event execution');
        //     done();
        // });
    });
});