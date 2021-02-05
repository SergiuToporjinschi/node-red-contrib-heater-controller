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
        var testData = [
            //User changes temp and locks it
            {
                input: {
                    isUserCustom: false,
                    isLocked: true,
                    userTargetValue: 25
                },
                output: {
                    isUserCustom: true,
                    isLocked: true,
                    userTargetValue: 25,
                    targetValue: 10 //It will be change on computation
                }
            },
            //user changes only the userTargetValue
            {
                input: {
                    isUserCustom: false,
                    isLocked: false,
                    userTargetValue: 25
                },
                output: {
                    isUserCustom: true,
                    isLocked: false,
                    userTargetValue: 25,
                    targetValue: 10 //It will be change on computation
                }
            },
            //user changes only the locking
            {
                input: {
                    isLocked: true,
                },
                output: {
                    isUserCustom: true,
                    isLocked: true,
                    userTargetValue: undefined,
                    targetValue: 3 //It will be change on computation
                }
            },
            //user changes only the userTargetValue
            {
                input: {
                    userTargetValue: 50,
                },
                output: {
                    isUserCustom: true,
                    isLocked: false,
                    userTargetValue: 50
                }
            }
        ]

        itParam("Check: onUserConfig", testData, (val) => {
            hc.oldStatus = {};
            hc.recalculate = sinon.fake();
            hc.status = { currentSchedule: { temp: 10 }, isLocked: false, userTargetValue: 5, isUserCustom: false, targetValue: 3 };
            hc.onUserConfig({
                payload: val.input
            });
            if (typeof (val.output.isUserCustom) !== 'undefined')
                should(hc.status.isUserCustom).be.equal(val.output.isUserCustom, 'incorrect isUserCustom: ' + JSON.stringify(val));
            if (typeof (val.output.isLocked) !== 'undefined')
                should(hc.status.isLocked).be.equal(val.output.isLocked, 'incorrect isLocked: ' + JSON.stringify(val));
            if (typeof (val.output.userTargetValue) !== 'undefined')
                should(hc.status.userTargetValue).be.equal(val.output.userTargetValue, 'incorrect userTargetValue: ' + JSON.stringify(val));
            if (typeof (val.output.targetValue) !== 'undefined')
                should(hc.status.targetValue).be.equal(val.output.targetValue, 'incorrect targetValue: ' + JSON.stringify(val));

            should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
        });
    });
});