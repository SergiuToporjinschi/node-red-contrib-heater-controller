var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var sinon = require('sinon');
var _ = require('lodash');
var helper = require("./testHelper.js");
describe("ws", () => {
    describe('webSocketServer', function () {
        var id, WS;
        beforeEach(() => {
            delete require.cache[require.resolve('../nodes/heater/webSocketServer')];
            RED = helper.getMockedRED();
            RED.server.on = sinon.fake();
            WS = helper.getWsMocked();
            id = 'dummyID';
        });
        it('Constructor default settings', function (done) {
            WS.createInstance(RED, id);

            should(WS.wsw.getURL(id)).be.equal("/heaterController/io/dummyID", 'Invalid generated URL');
            should(WS.wsw).not.be.undefined('Constructor failed!!!');
            should(RED.server.on.callCount).be.equal(1, 'Upgrade not called');
            should(RED.server.on.firstCall.args[0]).be.equal('upgrade', 'Upgrade not called');
            should(RED.server.on.firstCall.args[1]).be.type('function', 'Upgrade not called with a callback function');
            done();
        });

        it('Constructor custom settings', function (done) {
            RED.settings.httpNodeRoot = '/node-red';

            WS.createInstance(RED, id);

            should(WS.wsw).not.be.undefined('Constructor failed!!!');
            should(WS.wsw.getURL(id)).be.equal("/node-red/heaterController/io/dummyID", 'Invalid generated URL');
            should(RED.server.on.callCount).be.equal(1, 'Upgrade not called');
            should(RED.server.on.firstCall.args[0]).be.equal('upgrade', 'Upgrade not called');
            should(RED.server.on.firstCall.args[1]).be.type('function', 'Upgrade not called with a callback function');
            done();
        });

        it('Constructor check for singleTone', function (done) {
            RED.settings.httpNodeRoot = '/node-red';

            WS.createInstance(RED, id);

            should(WS.wsw).not.be.undefined('Constructor failed!!!');
            should(RED.server.on.callCount).be.equal(1, 'Upgrade not called');
            should(RED.server.on.firstCall.args[0]).be.equal('upgrade', 'Upgrade not called');
            should(RED.server.on.firstCall.args[1]).be.type('function', 'Upgrade not called with a callback function');

            WS.createInstance(RED, id);

            should(WS.wsw).not.be.undefined('Constructor failed!!!');
            should(WS.wsw.getURL(id)).be.equal("/node-red/heaterController/io/dummyID", 'Invalid generated URL');
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
                WS = helper.getWsMocked();
                WS.createInstance(RED, id);
                ws = WS.wsw;
            });

            it('Test shutdownServer', function (done) {
                ws.unRegister(id);
                done();
            });

            itParam('Test registerIncomingEvents: throws exception', [
                { topic: undefined, func: undefined, id: undefined },
                { topic: undefined, func: 2, id: undefined },
                { topic: 2, func: undefined, id: undefined },
                { topic: 'trigger', func: undefined, id: undefined },
                { topic: 2, func: function () { }, id: undefined },
                { topic: undefined, func: function () { }, id: undefined }
            ], function (val) {
                should(function () {
                    ws.registerIncomingEvents(val.topic, val.func, val.id);
                }).throw('Invalid arguments [topic:string, func:function, id:string]');
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

            itParam('Test send: throw exception', [{ id: 'test' }, { topic: 'test' }, { topic: 1, id: true }], function (val) {
                should(() => {
                    ws.send(val.id, val.topic, val.message);
                }).throw('Invalid id or topic', 'Should not be able to send message without an valid topic');
            });

            it('Test _onReceivedMessage: decode and trigger event', function (done) {
                ws.broadcast = sinon.fake();
                var eventCB = sinon.fake();

                ws.registerIncomingEvents('fakeTopic', eventCB, id);
                ws._onReceivedMessage(id, JSON.stringify({ topic: 'fakeTopic', payload: 'payload' }));

                should(eventCB.callCount).be.equal(1, 'Event not triggered when a new message arrives');
                should(eventCB.firstCall.args[0]).be.deepEqual({ topic: 'fakeTopic', payload: 'payload' }, 'Event function not triggered with sent payload');
                done();
            });

            it('Test send: client does not exists', function (done) {
                should(() => {
                    ws.send('test', 'test', 'test');
                }).throw('Backend client not registered', 'Un registered client can call send method');
                done();
            });
        });

        describe('Tests with WS client', () => {
            var instance;

            beforeEach(() => {
                RED = helper.getMockedRED();
                RED.server = helper.startHTTPServer();
                WS = helper.getWsMocked();
                instance = WS.createInstance(RED, id);
            });

            afterEach(() => {
                RED.server.shutdown();
            });

            it('Test _shouldIHandleThis: for invalid urls', function (done) {
                var connectionCalledFake = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);
                should(instance._shouldIHandleThis(1)).be.false('Accepts invalid urls');
                should(instance._shouldIHandleThis('/heaterController/io')).be.false('Accepts invalid urls');
                should(instance._shouldIHandleThis('/heaterController/io/' + id)).be.true('Does not accepts valid urls');
                done();
            });

            it('Test _handleServerUpgrade: handling a proper request', function (done) {
                var connectionCalledFake = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);

                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id);

                setTimeout((() => {
                    should(connectionCalledFake.callCount).be.equal(1, "WebSocketServer is not attached or connection event is not called");
                    done();
                }).bind(this), 2 * 1000);
            });

            it('Test _handleServerUpgrade: testing invalid client connection', function (done) {
                var connectionCalledFake = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);

                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id + 1, () => {
                    instance.send(id, 'test', 'test');
                });
                setTimeout((() => {
                    should(connectionCalledFake.callCount).be.equal(0, "WebSocketServer is not attached or connection event is not called");
                    done();
                }).bind(this), 2 * 1000);
            });

            it('Test send: can send message to existing client', function (done) {
                var connectionCalledFake = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);

                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id, () => {
                    instance.send(id, 'test', 'test');
                });
                setTimeout((() => {
                    should(connectionCalledFake.callCount).be.equal(1, "WebSocketServer is not attached or connection event is not called");
                    done();
                }).bind(this), 2 * 1000);
            });

            it('Test unRegister: should be able to unregistered a node', function (done) {
                var connectionCalledFake = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);

                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id, () => {
                    instance.send(id, 'test', 'test');
                    instance.unRegister(id);
                });

                setTimeout((() => {
                    should(connectionCalledFake.callCount).be.equal(1, "WebSocketServer is not attached or connection event is not called");
                    done();
                }).bind(this), 2 * 1000);
            });

            it('Test unRegister: should be able to unregistered a node', function (done) {
                var connectionCalledFake = sinon.fake();
                var connectionCalledFake1 = sinon.fake();
                instance.registerIncomingEvents('connection', connectionCalledFake, id);
                instance1 = WS.createInstance(RED, id + 1);
                instance1.registerIncomingEvents('connection', connectionCalledFake1, id + 1);

                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id, () => {
                    instance.send(id, 'test', 'test');
                    instance.unRegister(id);
                });
                new helper.WSClient('ws://localhost:8080/heaterController/io/' + id + 1, () => {
                    instance1.send(id + 1, 'test', 'test');
                    instance1.unRegister(id + 1);
                });


                setTimeout((() => {
                    should(connectionCalledFake.callCount).be.equal(1, "WebSocketServer is not attached or connection event is not called");
                    done();
                }).bind(this), 3 * 1000);
            });
        });
    });
});