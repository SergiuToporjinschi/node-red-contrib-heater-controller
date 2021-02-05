var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var HeaterController = require('../heaterLoader');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Functions", function () {
    var RED = helper.getMockedRED();;
    var hc;
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.spy(RED);
        var HeaterController = helper.getMockedHeaterController(require('../heaterLoader'));
        sandbox.spy(HeaterController);
    })
    afterEach(function () {
        sandbox.restore();
    });
    describe('Other', () => {
        beforeEach(() => {
            RE = helper.getMockedRED();
            delete require.cache[require.resolve('../heaterLoader')];
            var heat = helper.getMockedHeaterControllerFaked(require('../heaterLoader'))
            hc = new heat(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5,
                topic: 'heaterStatus'
            });
            hc.status.currentSchedule = {}; //not null
            sandbox.restore()
        });
        itParam("Check: onUserConfig.userTargetValue", [true, false], (val) => {
            // hc.oldStatus = {};
            // hc.recalculate = sinon.fake();
            // hc.status = { isLocked: !val };
            // hc.onUserConfig({
            //     payload: {
            //         userTargetValue: val
            //     }
            // });
            // should(hc.status.isLocked).be.equal(val, ' isLocked is not setting status.isLocked');
            // should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
        });
    });
});