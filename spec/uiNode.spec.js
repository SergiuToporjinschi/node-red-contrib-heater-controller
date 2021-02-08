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
    var RED = helper.getMockedRED();;
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
    it('Test Constructor', function (done) {
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
            uiNode.messageIn({ topic: 'event1', payload: 'test' });
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
            should(() => { uiNode.messageIn({ topic: 'event1', payload: 'test' }); }).throw('Calling unregistered event: event1', 'Events are not removed when calling removeEvent()');
            should(fakeFunc.callCount).be.equal(0, 'Event still exists after calling removeEvent');
            done();
        });
    });
});