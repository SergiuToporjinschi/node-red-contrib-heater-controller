var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var UINode = require('../nodes/heater/uINode');
const { wsw } = require('../nodes/heater/webSocketServer');
describe("Functions", function () {
    const sandbox = sinon.createSandbox();
    var id;
    // it('Test _newClientConnected: when first connect send config and status', function (done) {
    //     RED = helper.getMockedRED();
    //     delete require.cache[require.resolve('../nodes/heater/webSocketServer')];
    //     delete require.cache[require.resolve('../nodes/heater/uINode')];
    //     delete require.cache[require.resolve('../nodes/heater/heater')];
    //     delete require.cache[require.resolve('./testHelper.js')];
    //     var WS = require('../nodes/heater/webSocketServer');
    //     WS.wsw = undefined;
    //     var UINode = require('../nodes/heater/uINode');
    //     UINode.prototype.debug = sinon.fake();
    //     UINode.prototype.error = sinon.fake();
    //     UINode.prototype.on = sinon.fake();
    //     UINode.prototype.id = 'fakeIdUINode';
    //     RED.server = helper.startHTTPServer();
    //     var config = {
    //         title: 'test',
    //         calendar: JSON.stringify(helper.calendar)
    //     }

    //     uiNode = new UINode(RED, Object.assign({}, config, { displayMode: 'buttons' }));
    //     uiNode.status = {
    //         currentHeaterStatus: { temp: 22 },
    //         nextSchedule: { temp: 20 },
    //         isLocked: true,
    //         userTargetValue: 10
    //     };

    //     var wsClient = new helper.WSClient('ws://localhost:8080/heaterController/io/' + UINode.prototype.id, undefined, (message) => {
    //         should(message.utf8Data).be.String("message is not an object");
    //         var data = JSON.parse(message.utf8Data);
    //         should(data).be.Object("message is not an object");
    //         if (data.topic === 'config') {
    //             should(data.topic).be.equal('config', "Config not send on client connected");
    //             should(data.payload).be.deepEqual(config, "Config not send on client connected");
    //         }
    //         if (data.topic === 'status') {
    //             should(data.topic).be.equal('status', "Status not send on client connected");
    //             should(data.payload).be.deepEqual(uiNode.status, "Config not send on client connected");
    //             wsClient.connection.drop();
    //             RED.server.shutdown();
    //             done();
    //         }
    //     });
        // setTimeout((() => {
        // }).bind(this), 3 * 1000);
    // });

});