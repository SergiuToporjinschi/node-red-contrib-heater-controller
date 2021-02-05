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
            }, {
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
            delete require.cache[require.resolve('../heaterLoader')];
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
        // "Sunday": { calendar
        //     "00:00": 19,
        //     "08:00": 20,
        //     "20:00": 22,
        //     "23:59": 19
        // }
        beforeEach(() => {
            RED = helper.getMockedRED();
            delete require.cache[require.resolve('../heaterLoader')];
            hc = new HeaterController(RED, {
                group: 'someGroup',
                calendar: JSON.stringify(helper.calendar),
                threshold: 0.5,
                topic: 'heaterStatus'
            });

        });

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
            should.equal(fakeSend.callCount, 1, "this.send method has been called more then once: " + JSON.stringify(val));
            should.type(fakeSend.lastCall.firstArg, 'object', 'this.send first parameter is not a msg object: ' + JSON.stringify(val));
            should.deepEqual(fakeSend.lastCall.firstArg, { topic: 'heaterStatus', payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
            ret.should.be.an.Object();
        });

        var data_rising = [];
        // var data_falling = [];
        for (var i = -1; i < 11; i = i + 0.5) {
            data_rising.push({
                currentTemp: i,
                exp: i >= 10.5 ? 'off' : 'on'
            });
        }

        // for (var i = 23; i > -1; i = i - 0.5) {
        //     data_falling.push({
        //         currentTemp: i,
        //         exp: i <= 20.5 ? 'on' : 'off'
        //     });
        // }
        // itParam("Test recalculate if !isLocked, schedule fixed, turning it on/off, currentTemp variates ", data_rising, (val) => {
        //     hc.status.isLocked = false;
        //     helper.setMockedDate('2021-01-28T06:00:00.000');//Thursday 06:20 tempTarget 10 C
        //     fakeSend = sinon.fake();
        //     hc.send = fakeSend;
        //     var ret = hc.messageIn({
        //         topic: 'currentTemp',
        //         payload: -5
        //     });
        //     var ret = hc.messageIn({
        //         topic: 'currentTemp',
        //         payload: val.currentTemp
        //     });
        //     should.equal(fakeSend.callCount, 1, "this.send method has been called more then once: " + JSON.stringify(val));
        //     should.type(fakeSend.lastCall.firstArg, 'object', 'this.send first parameter is not a msg object: ' + JSON.stringify(val));
        //     should.deepEqual(fakeSend.lastCall.firstArg, { topic: 'heaterStatus', payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
        //     ret.should.be.an.Object();
        // });
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
            delete require.cache[require.resolve('../heaterLoader')];

            var heat = helper.getMockedHeaterControllerFaked(require('../heaterLoader'));
            should(function () {
                RED.require = sinon.fake.returns(sinon.fake.returns({
                    addWidget: sinon.fake()
                }));
                heat.prototype._createWidget = sinon.fake();
                new heat(RED, val);
            }).throw('Missing configuration or group');
        });

        // itParam("Should throw exception: onUserConfig", [undefined, {}, { payload: true }, { payload: '' }, { payload: function () { } },
        //     { payload: { isLocked: 1 } }, { payload: {} }, { payload: { isLocked: '' } }, { payload: { isLocked: 'boolean' } },
        //     { payload: { userTargetValue: 1 } }, { payload: {} }, { payload: { isLocked: '' } }, { payload: { isLocked: 'boolean' } }
        // ], (val) => {
        //     should(function () {
        //         hc.onUserConfig(val);
        //     }).throw('Invalid payload');
        //     should(hc.error.callCount).be.aboveOrEqual(1, "Exception not logged!!!: " + JSON.stringify(val));
        // });

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

    });
});