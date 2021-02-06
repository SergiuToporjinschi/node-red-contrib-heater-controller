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

    /**
     * Test offSet calculation
     */
    describe("Test calculating schedule with offset", () => {
        beforeEach(() => {
            helper.setMockedDate('2021-01-31T08:00:00.000');//Sunday
            hc = new HeaterController(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5
            });
        });
        var offSetData = [
            {
                currentTime: '2021-01-31T08:00:00.000',
                offSet: 0,
                expected: {
                    time: '08:00',
                    day: 'Sunday',
                    temp: 20
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                offSet: 2,
                expected: {
                    time: '23:59',
                    day: 'Sunday',
                    temp: 19
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                //Without Offset
                expected: {
                    time: '08:00',
                    day: 'Sunday',
                    temp: 20
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                offSet: 0,
                expected: {
                    time: '08:00',
                    day: 'Sunday',
                    temp: 20
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                offSet: -1,
                expected: {
                    time: '00:00',
                    day: 'Sunday',
                    temp: 19
                }
            }, {//go bottom
                currentTime: '2021-01-31T16:22:00.000',
                offSet: -4,
                expected: {
                    time: '08:00',
                    day: 'Saturday',
                    temp: 20
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                offSet: 3,
                expected: {
                    time: '00:00',
                    day: 'Monday',
                    temp: 19
                }
            }, {
                currentTime: '2021-01-31T16:22:00.000',
                offSet: 1,
                expected: {
                    time: '20:00',
                    day: 'Sunday',
                    temp: 22
                }
            }, { //go to start
                currentTime: '2021-01-30T10:00:00.000',
                offSet: 5,
                expected: {
                    time: '20:00',
                    day: 'Sunday',
                    temp: 22
                }
            }

        ];
        itParam("Testing getScheduleOffSet", offSetData, (testSetting) => {
            // console.log(JSON.stringify(testSetting))
            helper.setMockedDate(testSetting.currentTime);//Sunday
            var ret = hc.getScheduleOffSet(testSetting.offSet);
            ret.time.length.should.be.equal(5);
            ret.time.should.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Incorrect time format: " + JSON.stringify(testSetting));

            ret.should.have.property("day").which.is.type("string", "day attribute is not a string: " + JSON.stringify(testSetting));
            ret.should.have.property("temp").which.is.type("number", "temp attribute is not number: " + JSON.stringify(testSetting));
            ret.should.have.property("time").which.is.type("string", "time attribute is not a string: " + JSON.stringify(testSetting));;

            ret.should.have.keys("day", "time", "temp");
            ret.should.be.deepEqual(testSetting.expected, 'Not expected object: ' + JSON.stringify(testSetting));
        });
    });

    /**
     * Test recalculate method
     */
    describe('Test recalculate isLocked = true', () => {
        var data_rising = [];
        var data_falling = [];
        for (var i = -5; i < 10; i = i + 0.5) {
            data_rising.push({
                currentTemp: i,
                exp: i >= 5.5 ? 'off' : 'on'
            });
        }

        for (var i = 10; i > -5; i = i - 0.5) {
            data_falling.push({
                currentTemp: i,
                exp: i <= 4.5 ? 'on' : 'off'
            });
        }

        beforeEach(() => {
            RE = helper.getMockedRED();
            delete require.cache[require.resolve('../nodes/heater/heater')];
            hc = new HeaterController(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5,
                topic: 'heaterStatus'
            });
            hc.status.currentSchedule = {}; //not null
        });

        var testData = [data_rising, data_falling];
        var savedStatus;
        for (var i in testData) {
            itParam("Test recalculate currentTemp falling and rising currentTemp", testData[i], (tstSet) => {
                hc.status.currentHeaterStatus = savedStatus; // the previous status needs to be carried to the next test
                hc.status.isLocked = true;
                hc.status.currentSchedule = hc.getScheduleOffSet();
                hc.status.nextSchedule = hc.getScheduleOffSet(1);
                hc.status.userTargetValue = 5;
                hc.oldStatus = hc.status;
                hc.status.currentTemp = tstSet.currentTemp;
                var ret = hc.recalculate();
                should.exist(ret, "Returned undefined: " + JSON.stringify(tstSet));
                ret.should.be.a.String();
                ret.should.equal(tstSet.exp, 'Unexpected value: ' + JSON.stringify(tstSet));
                savedStatus = hc.status.currentHeaterStatus;
            });
        }
    });

    describe('Test recalculate currentTemp falling', () => {
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

        const data_20C = [{
            time: '00:00',
            state: 'off'
        }, {
            time: '08:00',
            state: 'off'
        }, {
            time: '20:00',
            state: 'on'
        }, {
            time: '23:59',
            state: 'off'
        }];

        itParam("Test recalculate if !isLocked, schedule changed, turning it on/off, currentTemp static ", data_20C, (val) => {
            hc.status.isLocked = false;
            var fakeSend = sinon.fake();
            hc.send = fakeSend;
            hc.messageIn({//dummy value
                topic: 'currentTemp',
                payload: 20
            });
            helper.setMockedDate('2021-01-31T' + val.time + ':00.000');//Sunday
            fakeSend = sinon.fake();
            hc.send = fakeSend;
            var ret = hc.messageIn({
                topic: 'currentTemp',
                payload: 20
            });
            should.equal(fakeSend.callCount, 1, "this.send method has been called: " + JSON.stringify(val));
            should.type(fakeSend.lastCall.firstArg, 'object', 'this.send first parameter is not a msg object: ' + JSON.stringify(val));
            should.deepEqual(fakeSend.lastCall.firstArg, { topic: 'heaterStatus', payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
            ret.should.be.an.Object();
        });
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
            should.type(fakeSend.lastCall.firstArg, 'object', 'this.send first parameter is not a msg object: ' + JSON.stringify(val));
            should.deepEqual(fakeSend.lastCall.firstArg, { topic: 'heaterStatus', payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
        });
    });

    describe('Other', () => {
        beforeEach(() => {
            RE = helper.getMockedRED();
            delete require.cache[require.resolve('../nodes/heater/heater')];
            var heat = helper.getMockedHeaterControllerFaked(require('../nodes/heater/heater'))
            hc = new heat(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5,
                topic: 'heaterStatus'
            });
            hc.status.currentSchedule = {}; //not null
            sandbox.restore
        });

        itParam("Should throw exception: onTempChange", [{ payload: true }, { payload: '' }, { payload: function () { } }], (val) => {
            should(function () {
                hc.onTempChange(val);
            }).throw('Invalid payload');
            should(hc.error.callCount).be.aboveOrEqual(1, "Exception not logged!!!: " + JSON.stringify(val));
        });

        var exceptions = [
            undefined, 1, { currentTemp: '' }, { currentTemp: true }, { currentTemp: 1 },
            { currentTemp: 1, currentSchedule: 1 },
            { currentTemp: 1, currentSchedule: '' },
            { currentTemp: 1, currentSchedule: true }
        ]
        itParam("Should return undefined: recalculate", exceptions, (val) => {
            hc.status = val;
            var ret = hc.recalculate(val);
            should(hc.debug.callCount).be.aboveOrEqual(1, "Debug info not logged!!!: " + JSON.stringify(val));
            should(ret).be.type('undefined', 'Returns something even it should not!!!');
        });

        itParam("Should throw exception: constructor", [undefined, 1, { test: 1 }, { group: 1 }, { group: true }], (val) => {
            delete require.cache[require.resolve('../nodes/heater/heater')];

            var heat = helper.getMockedHeaterControllerFaked(require('../nodes/heater/heater'));
            should(function () {
                RED.require = sinon.fake.returns(sinon.fake.returns({
                    addWidget: sinon.fake()
                }));
                heat.prototype._createWidget = sinon.fake();
                new heat(RED, val);
            }).throw('Missing configuration or group');
        });

    });

    describe('Test onUserConfig', () => {
        beforeEach(() => {
            fakeSend = sinon.fake();
            hc.send = fakeSend;
        });
        itParam("Should throw exception for invalid payload: onUserConfig", [{}, true, '', function () { }, 1,
        { isLocked: 1 }, { isLocked: '1' }, { userTargetValue: '' }, { userTargetValue: true }, { isUserCustom: 1 }, { isUserCustom: 's' },
        ], (val) => {
            should(function () {
                hc.onUserConfig({
                    payload: val
                });
            }).throw('Invalid payload');
            should(hc.error.callCount).be.aboveOrEqual(1, "Exception not logged!!!: " + JSON.stringify(val));
        });
        itParam("Check: onUserConfig.isUserCustom", [true, false], (val) => {
            hc.recalculate = sinon.fake();
            hc.oldStatus = {};
            hc.status = {
                targetValue: 15,
                currentSchedule: {
                    temp: 17
                }
            };
            hc.onUserConfig({
                payload: {
                    isUserCustom: val
                }
            });
            if (val) {
                should(hc.status.userTargetValue).be.equal(hc.status.targetValue, 'isCustom = true is not changing userTargetValue');
            } else {
                should(hc.status.targetValue).be.equal(hc.status.currentSchedule.temp, ' isCustom = false is not setting targetValue with status.currentSchedule.temp');
            }
            should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
        });
        itParam("Check: onUserConfig.isLocked", [true, false], (val) => {
            // In case of true is freezing value until calendar change
            hc.oldStatus = {};
            hc.recalculate = sinon.fake();
            hc.status = { isLocked: !val };
            hc.onUserConfig({
                payload: {
                    isLocked: val
                }
            });
            should(hc.status.isLocked).be.equal(val, ' isLocked is not setting status.isLocked');
            should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
        });
        itParam("Check: onUserConfig.userTargetValue", [undefined, 10], (val) => {
            hc.oldStatus = {};
            hc.recalculate = sinon.fake();
            hc.status = { userTargetValue: (val || 0) + 5 };
            hc.onUserConfig({
                payload: {
                    userTargetValue: val
                }
            });
            var exp = val ? val : 5;
            should(hc.status.userTargetValue).be.equal(exp, ' userTargetValue is not setting status.userTargetValue');
            should(hc.recalculate.callCount).be.equal(1, 'Recalculate is not triggered when receiving a new configuration');
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