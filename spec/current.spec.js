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
        sandbox.spy(RED);
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

        var executionNo = 1;
        itParam("Test recalculate userCustomTemp ", [
            { isUserCustom: true, isLocked: true, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: true, isLocked: true, currentTemp: 20, userCurrentTemp: 18, state: 'off' },
            { isUserCustom: true, isLocked: true, currentTemp: 19, userCurrentTemp: 18, state: 'off' }, { isUserCustom: true, isLocked: true, currentTemp: 15, userCurrentTemp: 18, state: 'on' },
            //isUserCustom,isLocked false
            { isUserCustom: false, isLocked: false, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: false, isLocked: false, currentTemp: 20, userCurrentTemp: 18, state: 'off' },
            { isUserCustom: false, isLocked: false, currentTemp: 19, userCurrentTemp: 18, state: 'off' }, { isUserCustom: false, isLocked: false, currentTemp: 15, userCurrentTemp: 18, state: 'on' },
            //undefined
            { isUserCustom: undefined, isLocked: false, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: undefined, isLocked: false, currentTemp: 20, userCurrentTemp: 18, state: 'off' },
            { isUserCustom: undefined, isLocked: false, currentTemp: 19, userCurrentTemp: 18, state: 'off' }, { isUserCustom: undefined, isLocked: false, currentTemp: 15, userCurrentTemp: 18, state: 'on' }
        ], (val) => {
            helper.setMockedDate('2021-01-31T08:00:00.000');
            hc.status.isLocked = false;
            var fakeSend = sinon.fake();
            hc.send = fakeSend;
            hc.messageIn({//dummy value to make forced_ByScheduler = false
                topic: 'currentTemp',
                payload: val.currentTemp
            });
            // hc.onUserConfig
            fakeSend = sinon.fake();
            hc.send = fakeSend;
            var ret = hc.messageIn({//dummy value to make forced_ByScheduler = false
                topic: 'userConfig',
                payload: {
                    isUserCustom: val.isUserCustom,
                    isLocked: val.isLocked,
                    userTargetValue: val.userCurrentTemp
                }
            });
            should.equal(fakeSend.callCount, 1, "this.send method has been called: " + JSON.stringify(val));
            // should.type(fakeSend.lastCall.firstArg, 'object', 'this.send first parameter is not a msg object: ' + JSON.stringify(val));
            should.deepEqual(fakeSend.lastCall.firstArg[0], { topic: hc.config.topic, payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
            should.deepEqual(fakeSend.lastCall.firstArg[1], { topic: 'status', payload: hc.status }, 'this.send second parameter is not correct msg object: ' + JSON.stringify(val));

            executionNo++;
        });
    });
});