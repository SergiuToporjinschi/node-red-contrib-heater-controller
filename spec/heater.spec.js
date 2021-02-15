var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var HeaterController = require('../nodes/heater/heater');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("heater.spec.js", () => {
    describe("Functions", function () {
        var RED = helper.getMockedRED();;
        var hc;
        const sandbox = sinon.createSandbox();
        beforeEach(() => {
            // sandbox.spy(RED);
            var HeaterController = helper.getMockedHeaterControllerFaked(require('../nodes/heater/heater'));
            sandbox.spy(HeaterController);
        })
        afterEach(function () {
            sandbox.restore();
        });

        /**
         * Test offSet calculation
         */
        describe("Test calculating schedule with offset", () => {
            ;
            beforeEach(() => {
                // RED.require.withArgs('node-red-dashboard').returns(sinon.fake());

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
                var fakeTimer = helper.setMockedDate(testSetting.currentTime);//Sunday
                var ret = hc.getScheduleOffSet(testSetting.offSet);
                ret.time.length.should.be.equal(5);
                ret.time.should.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Incorrect time format: " + JSON.stringify(testSetting));

                ret.should.have.property("day").which.is.type("string", "day attribute is not a string: " + JSON.stringify(testSetting));
                ret.should.have.property("temp").which.is.type("number", "temp attribute is not number: " + JSON.stringify(testSetting));
                ret.should.have.property("time").which.is.type("string", "time attribute is not a string: " + JSON.stringify(testSetting));;

                ret.should.have.keys("day", "time", "temp");
                ret.should.be.deepEqual(testSetting.expected, 'Not expected object: ' + JSON.stringify(testSetting));
                fakeTimer.restore();
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
                hc._sendToFrontEnd = sinon.fake();
                hc._messageIn({//dummy value
                    topic: 'currentTemp',
                    payload: 20
                }, sinon.fake());
                var fakeTimer = helper.setMockedDate('2021-01-31T' + val.time + ':00.000');//Sunday
                hc._messageIn({
                    topic: 'currentTemp',
                    payload: 20
                }, fakeSend);
                should(fakeSend.callCount).be.equal(1, 'Send function not called :' + JSON.stringify(val))
                should(fakeSend.lastCall.args[0]).be.Array('Send is not called with an array:' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][0], { topic: 'heaterStatus', payload: val.state }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][1], { topic: 'status', payload: hc.status }, 'this.send second parameter is not correct msg object: ' + JSON.stringify(val));
                fakeTimer.restore();
            });
            itParam("Test recalculate userCustomTemp ", [
                { isUserCustom: true, isLocked: true, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: true, isLocked: true, currentTemp: 20, userCurrentTemp: 18, state: 'off' },
                { isUserCustom: true, isLocked: true, currentTemp: 19, userCurrentTemp: 18, state: 'off' }, { isUserCustom: true, isLocked: true, currentTemp: 15, userCurrentTemp: 18, state: 'on' },
                //isUserCustom,isLocked false
                { isUserCustom: false, isLocked: false, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: false, isLocked: false, currentTemp: 15, userCurrentTemp: 18, state: 'on' },
                //undefined
                { isUserCustom: undefined, isLocked: false, currentTemp: 15, userCurrentTemp: 20, state: 'on' }, { isUserCustom: undefined, isLocked: false, currentTemp: 20, userCurrentTemp: 18, state: 'off' },
                { isUserCustom: undefined, isLocked: false, currentTemp: 19, userCurrentTemp: 18, state: 'off' }, { isUserCustom: undefined, isLocked: false, currentTemp: 15, userCurrentTemp: 18, state: 'on' }
            ], (val) => {
                var fakeTimer = helper.setMockedDate('2021-01-31T08:00:00.000');
                hc.status.isLocked = false;
                hc.status.currentSchedule.temp = 20;
                hc._sendToFrontEnd = sinon.fake();
                hc._messageIn({//dummy value to make forced_ByScheduler = false
                    topic: 'currentTemp',
                    payload: val.currentTemp
                }, sinon.fake());
                var fakeSend = sinon.fake();
                hc._messageIn({//dummy value to make forced_ByScheduler = false
                    topic: 'userConfig',
                    payload: {
                        isUserCustom: val.isUserCustom,
                        isLocked: val.isLocked,
                        userTargetValue: val.userCurrentTemp
                    }
                }, fakeSend);
                should(fakeSend.callCount).be.equal(1, 'Send function not called :' + JSON.stringify(val))
                should(fakeSend.lastCall.args[0]).be.Array('Send is not called with an array:' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][0].payload, val.state, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][1].payload, hc.status, 'this.send second parameter is not correct msg object: ' + JSON.stringify(val));
                fakeTimer.restore();
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

            itParam("Current temp remains static from call to call: onTempChange", [-10, 0, 10, 25], (val) => {
                var fakeTimer = helper.setMockedDate('2021-01-31T08:00:00.000'); // 20 C
                var fakeSend = sinon.fake();
                hc.send = fakeSend;
                hc._sendToFrontEnd = sinon.fake();

                hc._messageIn({
                    topic: 'currentTemp',
                    payload: val
                }, sinon.fake());

                var initialStatus = hc.status;

                fakeSend = sinon.fake();
                hc.send = fakeSend;
                ret = hc._messageIn({
                    topic: 'currentTemp',
                    payload: val
                }, fakeSend);
                should(fakeSend.callCount).be.equal(1, 'Send function not called :' + JSON.stringify(val))
                should(fakeSend.lastCall.args[0]).be.Array('Send is not called with an array:' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][0], { topic: 'heaterStatus', payload: val < 20 ? 'on' : 'off' }, 'this.send first parameter is not correct msg object: ' + JSON.stringify(val));
                should.deepEqual(fakeSend.lastCall.args[0][1], { topic: 'status', payload: initialStatus }, 'this.send second parameter is not correct msg object: ' + JSON.stringify(val));
                fakeTimer.restore();
            });

            var exceptions = [undefined, 1,
                { currentTemp: '' }, { currentTemp: true }, { currentTemp: 1 },
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
                    heat.prototype._createWidget = sinon.fake();
                    new heat(RED, val);
                }).throw('Missing configuration or group');
            });

        });
    });
});