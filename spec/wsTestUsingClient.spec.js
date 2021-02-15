var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");


var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Functions", function () {
    const sandbox = sinon.createSandbox();
    var id;
    // beforeEach(() => {
    //     delete require.cache[require.resolve('../nodes/heater/webSocketServer')];
    //     delete require.cache[require.resolve('../nodes/heater/uINode')];
    //     delete require.cache[require.resolve('../nodes/heater/heater')];
    //     delete require.cache[require.resolve('./testHelper.js')];
    //     WS = require('../nodes/heater/webSocketServer');
    //     RED = helper.getMockedRED();
    //     id = 'dummyID';
    // });

    // itParam('Test _shouldIHandleThis: for invalid urls', [1], function () {
    //     var instance = WS.createInstance(RED, id + 1)
    //     var connectionCalledFake = sinon.fake();
    //     instance.registerIncomingEvents('connection', connectionCalledFake, id + 1);
    //     should(instance._shouldIHandleThis(1)).be.false('Accepts invalid urls');
    //     should(instance._shouldIHandleThis('/heaterController/io')).be.false('Accepts invalid urls');
    //     should(instance._shouldIHandleThis('/heaterController/io/' + id + 1)).be.true('Does not accepts valid urls');
    // });

    // it('Test _handleServerUpgrade: handling a proper request', function (done) {
    //     RED.server = helper.startHTTPServer();
    //     var instance = WS.createInstance(RED, id);
    //     var connectionCalledFake = sinon.fake();
    //     instance.registerIncomingEvents('connection', connectionCalledFake, id);

    //     var wsClient = new helper.WSClient('ws://localhost:8080/heaterController/io/' + id, function () {
    //     });

    //     setTimeout(() => {
    //         RED.server.close();
    //         should(connectionCalledFake.callCount).be.equal(1, "WebSocketServer is not attached or connection event is not called");
    //         done();
    //     }, 3 * 1000);
    // });

});