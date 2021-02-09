var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var UINode = require('../nodes/heater/uINode');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Functions", function () {
    var RED = helper.getMockedRED();
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        RED = helper.getMockedRED();
        delete require.cache[require.resolve('../nodes/heater/uINode')];
        UINode.prototype.debug = sinon.fake();
        UINode.prototype.error = sinon.fake();
        UINode.prototype.on = sinon.fake();
    })
    afterEach(function () {
        sandbox.restore();
    });
    it('Test Constructor: throws an error', function (done) {
        UINode.prototype.on = sinon.stub().withArgs('input', function () { }).throws(new Error('an error message'));
        should(() => {
            new UINode(RED, {
                displayMode: 'buttons',
                calendar: JSON.stringify(helper.calendar)
            });
        }).throw('an error message', 'Not expected exception message!!!');
        should(UINode.prototype.error.callCount).be.equal(1, 'Exception not logged!!!');
        should(RED.nodes.createNode.callCount).be.equal(1, 'uiNode is not extending Node-red-node');
        should(RED.require.callCount).be.equal(1, 'Dashboard node ui not called');
        should(UINode.prototype.on.callCount).be.equal(1, 'uiNode is not extending Node-red-node');
        done();
    });

    it('Test _createWidget: create design throws error', function (done) {
        RED.require = sinon.stub();
        var addWidgetStub = sinon.stub();
        var constrUI = sinon.stub();
        addWidgetStub.throws(new Error('anError'));
        constrUI.returns({ addWidget: addWidgetStub });
        RED.require.withArgs('node-red-dashboard').returns(constrUI);

        UINode.prototype.on = sinon.stub().withArgs('input', function () { }).throws(new Error('an error message'));
        should(() => {
            new UINode(RED, {
                displayMode: 'buttons',
                calendar: JSON.stringify(helper.calendar)
            });
        }).throw('anError', 'Not expected exception message!!!');
        should(UINode.prototype.error.callCount).be.equal(2, 'Exception not logged!!!');
        RED = helper.getMockedRED();
        done();
    });
    describe('Test Methods', () => {
        var uiNode = undefined;
        beforeEach(() => {
            uiNode = new UINode(RED, {
                displayMode: 'buttons',
                calendar: JSON.stringify(helper.calendar)
            });
        });

        itParam('Test addEvent: throw exception', [{ topic: undefined, func: undefined }, { topic: undefined, func: function () { } }, { topic: 'test', func: undefined }], function (val) {
            should(function () {
                uiNode.addEvent(val.topic, val.func);
            }).throw('Invalid arguments [topic:string, func:function]', 'Not throwing exception on invalid topic: ' + JSON.stringify(val));
            should(UINode.prototype.error.callCount).be.equal(1, 'Exception not logged!!!: ' + JSON.stringify(val));
        });

        it('Test addEvent: register event ', function (done) {
            var fakeFunc = sinon.fake();
            uiNode.addEvent('event1', fakeFunc);
            uiNode.input({ topic: 'event1', payload: 'test' }, sinon.fake(), sinon.fake());
            should(fakeFunc.callCount).be.equal(1, 'Event not registered or not called');
            should(fakeFunc.lastCall.args[0].topic).be.equal('event1', 'Event not registered or not called');
            done();
        });

        it('Test removeEvent: throw exception ', function (done) {
            should(() => { uiNode.removeEvent(); }).throw('Invalid argument [topic:string]', 'removeEvent does not throw exception on invalid topic');
            should(() => { uiNode.removeEvent(1); }).throw('Invalid argument [topic:string]', 'removeEvent does not throw exception on invalid topic');
            done();
        });

        it('Test removeEvent: remove event ', function (done) {
            var fakeFunc = sinon.fake();
            uiNode.addEvent('event1', fakeFunc);
            uiNode.removeEvent('event1');
            should(() => { uiNode._messageIn({ topic: 'event1', payload: 'test' }); }).throw('Calling unregistered event: event1', 'Events are not removed when calling removeEvent()');
            should(fakeFunc.callCount).be.equal(0, 'Event still exists after calling removeEvent');
            done();
        });

        itParam('Test messageIn: throw exception ', [{}, { topic: 2 }], function (val) {
            var sendFunc = sinon.fake();
            var doneCB = sinon.fake();
            uiNode.input(val, sendFunc, doneCB);
            should(uiNode.error.callCount).be.equal(2, 'Exception is not logged ' + JSON.stringify(val));
            should(uiNode.error.firstCall.args[0]).be.equal('Invalid Topic!!! ', 'Exception is not logged ' + JSON.stringify(val));
            should(uiNode.error.secondCall.args[0].message).be.equal('Invalid Topic!!!', 'Exception is not logged ' + JSON.stringify(val));
            should(doneCB.callCount).be.equal(1, 'Exception is not forward to callback function');
            should(doneCB.firstCall.args[0]).be.deepEqual(uiNode.error.secondCall.args[0], 'Exception is not forward to callback function');
        });

        it('Test messageIn: event is not returning array', function (done) {
            var fakeFunc = sinon.stub().returns('strTest');
            var sendFunc = sinon.fake();
            var doneCB = sinon.fake();
            uiNode.addEvent('event1', fakeFunc);
            uiNode.input({ topic: 'event1', payload: 'test' }, sendFunc, doneCB);
            should(fakeFunc.callCount).be.equal(1, 'Event not registered or not called');
            should(fakeFunc.lastCall.args[0].topic).be.equal('event1', 'Event not registered or not called');
            should(sendFunc.callCount).be.equal(1, 'Send function not called');
            should(doneCB.callCount).be.equal(1, 'Input CallBack is not called');
            should(Array.isArray(sendFunc.firstCall.args[0])).be.True('Should send an array');
            should(sendFunc.firstCall.args[0]).be.deepEqual([undefined, undefined], 'An empty array should be thrown when calling event without a proper return message');
            done();
        });
        // [{ topic: 'status', payload: { test: 'somePayload' } }, { topic: 'status', payload: { test: 'somePayload' } }]

        it('Test messageIn: event returns valid topics to be send to output', function (done) {
            var val = [undefined, { topic: 'status', payload: { test: 'somePayload' } }]
            var fakeFunc = sinon.stub().returns(val);
            var sendFunc = sinon.fake();
            var doneCB = sinon.fake();
            uiNode.addEvent('event1', fakeFunc);
            uiNode.input({ topic: 'event1', payload: 'test' }, sendFunc, doneCB);
            should(fakeFunc.callCount).be.equal(1, 'Event not registered or not called');
            should(fakeFunc.lastCall.args[0].topic).be.equal('event1', 'Event not registered or not called');
            should(sendFunc.callCount).be.equal(1, 'Send function not called');
            should(Array.isArray(sendFunc.firstCall.args[0])).be.True('Should send an array');
            should(sendFunc.lastCall.args[0]).be.deepEqual(val, 'Output expected is an array of messages');
            should(doneCB.callCount).be.equal(1, 'Input CallBack is not called');
            done();
        });
    });
});