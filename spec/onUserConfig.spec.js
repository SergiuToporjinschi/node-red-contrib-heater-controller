var sinon = require("sinon");
var helper = require("./testHelper.js");
var itParam = require('mocha-param');
var should = require("should");
// var WS = require('../nodes/heater/webSocketServer');

describe('Test onUserConfig', () => {
    var userScenarios = require('./userInputScenarios');
    var RED = helper.getMockedRED();;
    var hc;
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        // sandbox.spy(RED);
        var HeaterController = helper.getMockedHeaterControllerFaked(require('../nodes/heater/heater'));
        hc = new HeaterController(RED, {
            group: 'someGroup',
            calendar: JSON.stringify(helper.calendar),
            threshold: 0.5
        });
        sandbox.spy(HeaterController);
    })

    afterEach(function () {
        sandbox.restore();
    });

    itParam("Check: onUserConfig throw exception", [
        {}, { payload: 1 }, { payload: "" }, { otherProp: 2 },
        { payload: {}}
    ], (val) => {
        hc.recalculate = sinon.fake();
        hc.oldStatus = {};
        hc.status = val.status;
        hc.recalculate = sinon.stub().returns('on');
        should(() => {
            hc.onUserConfig({
                payload: val.input
            });
        }).throw('Invalid payload', 'No exception on invalid input');
        should(hc.error.callCount).be.equal(1, 'Not logged exception');
    });

    itParam("Check: onUserConfig all cases", userScenarios, (val) => {
        hc.recalculate = sinon.fake();
        hc.oldStatus = {};
        hc.status = val.status;
        hc.recalculate = sinon.stub().returns('on');

        var resp = hc.onUserConfig({
            payload: val.input
        });

        should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
        if (typeof (val.output.isUserCustom) !== 'undefined') {
            should(resp.status.isUserCustom).be.equal(val.output.isUserCustom, 'case: ' + val.case + ' invalid: isUserCustom');
        }
        if (typeof (val.output.isLocked) !== 'undefined') {
            should(resp.status.isLocked).be.equal(val.output.isLocked, 'case: ' + val.case + ' invalid: isLocked');
        }
        if (typeof (val.output.targetValue) !== 'undefined') {
            should(resp.status.targetValue).be.equal(val.output.targetValue, 'case: ' + val.case + ' invalid: targetValue');
        }
        if (typeof (val.output.userTargetValue) !== 'undefined') {
            should(resp.status.userTargetValue).be.equal(val.output.userTargetValue, 'case: ' + val.case + ' invalid: userTargetValue');
        }
    });
});