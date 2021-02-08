var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var HeaterController = require('../nodes/heater/heater');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Functions", function () {
    var RED = helper.getMockedRED();;
    var hc;
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        // sandbox.spy(RED);
        var HeaterController = helper.getMockedHeaterController(require('../nodes/heater/heater'));
        sandbox.spy(HeaterController);
    })
    afterEach(function () {
        sandbox.restore();
    });
    describe('Other', () => {
        // "Sunday": { calendar
        //     "00:00": 19,
        //     "08:00": 20,
        //     "20:00": 22,
        //     "23:59": 19
        // }
        beforeEach(() => {
            RED = helper.getMockedRED();
            delete require.cache[require.resolve('../nodes/heater/heater')];
            hc = new HeaterController(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5,
                topic: 'heaterStatus'
            });
        });
    });
});