var sinon = require('sinon');
var should = require("should");
var _ = require("lodash");
var helper = require("./testHelper.js");
require('should-sinon');

describe("Functions", function () {

    var node = require('../backEndNode.js');

    afterEach(function () {
        helper.mockedNode.context.context = {};
    });

    describe("Loading", () => {
        it("Loading node", (done) => {
            var backend = new node({
                'group': "test"
            }, helper.mockedNode);
            backend.defaultInfoNode.should.not.be.undefined();
            backend.defaultInfoNode.should.be.Object();
            backend.defaultInfoNode.should.have.property('targetValue');

            backend.beforeSend.should.be.Function();
            backend.beforeEmit.should.be.Function();
            done();
        });
    });

    describe("beforeEmit and beforeSend", () => {
        it('BeforeEmit backword compatibility', (done) => {
            helper.mockedNode.send = sinon.spy();
            var backend = new node({
                'group': "test"
            }, helper.mockedNode);

            backend.recalculate = sinon.spy();

            var msg = { topic: 'currentTemp' };
            backend.beforeEmit(msg, 10);
            msg.topic.should.be.equal('userConfig')

            var msg = { topic: 'userTargetValue' };
            backend.beforeEmit(msg, 15);
            msg.topic.should.be.equal('userConfig')

            var msg = { topic: 'isUserCustomLocked' };
            backend.beforeEmit(msg, false);
            msg.topic.should.be.equal('userConfig')
            backend.recalculate.should.be.calledThrice();
            helper.mockedNode.send.should.be.calledThrice();
            done();
        });
    });

    describe("Test other functions", () => {
        it('Test getScheduleTemp', (done) => {
            var backend = new node({
                'group': "test",
                calendar: helper.calendar,
                thresholdRising: 0.5,
                thresholdFalling: 0.5
            }, helper.mockedNode);

            helper.setMockedDate('2020-02-25T12:00:00.135Z');//Wednesday
            // "Tuesday": {
            //     "00:00": 19,
            //     "06:20": 22,
            //     "08:00": 19,
            //     "16:40": 23,
            //     "23:59": 19
            // },
            var ret = backend.getScheduleTemp(helper.calendar, -1);
            ret.day.should.be.equal('Tuesday');
            ret.temp.should.be.equal(19);
            ret.time.should.be.equal('08:00');

            ret = backend.getScheduleTemp(helper.calendar, 0);
            ret.day.should.be.equal('Tuesday');
            ret.temp.should.be.equal(19);
            ret.time.should.be.equal('08:00');

            ret = backend.getScheduleTemp(helper.calendar, 1);
            ret.day.should.be.equal('Tuesday');
            ret.temp.should.be.equal(23);
            ret.time.should.be.equal('16:40');

            ret = backend.getScheduleTemp(helper.calendar, -2);
            ret.day.should.be.equal('Tuesday');
            ret.temp.should.be.equal(22);
            ret.time.should.be.equal('06:20');

            var ret = backend.getScheduleTemp(helper.calendar, -100);
            ret.should.be.empty();
            done();
        });
    });


    describe("Testing function recalculate", () => {
        var backend;

        before(() => {
            backend = new node({
                'group': "test",
                calendar: helper.calendar,
                thresholdRising: 0.5,
                thresholdFalling: 0.5
            }, helper.mockedNode);
            // "Wednesday": {
            //     "00:00": 19,
            //     "06:20": 22,
            //     "08:00": 19,
            //     "16:40": 22,
            //     "23:59": 19
            // },
            helper.setMockedDate('2019-05-15T17:01:58.135Z'); //Wednesday
        });

        it('Recalculate based on calendar', (done) => {
            var infoNode = _.extend(_.cloneDeep(helper.defaNewInfoNode), {
                "currentTemp": 25
            });

            backend.recalculate(helper.defaLastInfoNode, infoNode);
            infoNode.currentSchedule.day.should.be.equal("Wednesday", "currentSchedule should be Wednesday 2019-05-15T17:01:58.135Z");
            infoNode.currentSchedule.temp.should.be.equal(22, "currentSchedule temperature should be taken from calendar");
            infoNode.currentSchedule.time.should.be.equal("16:40", "currentSchedule should be Wednesday 2019-05-15T17:01:58.135Z");

            infoNode.nextSchedule.day.should.be.equal("Wednesday", "nextSchedule should be Wednesday 2019-05-15T23:59:00.135Z");
            infoNode.nextSchedule.temp.should.be.equal(19, "nextSchedule temperature should be taken from calendar from next step");
            infoNode.nextSchedule.time.should.be.equal("23:59", "nextSchedule should be Wednesday 2019-05-15T23:59:00.135Z");

            infoNode.targetValue.should.be.equal(infoNode.currentSchedule.temp, "targetValue should be the same with the one from currentSchedule");
            done();
        });

        it('Recalculate based on user request', (done) => {
            var lastInfoNode = _.extend(_.cloneDeep(helper.defaLastInfoNode), {
                "currentSchedule": backend.getScheduleTemp(helper.calendar),
                "nextSchedule": backend.getScheduleTemp(helper.calendar, 1),
                "currentHeaterStatus": "off",
                "currentTemp": 22,
                "userTargetValue": 20
            });
            var newInfoNode = _.extend(_.cloneDeep(helper.defaNewInfoNode), {
                "currentSchedule": backend.getScheduleTemp(helper.calendar),
                "nextSchedule": backend.getScheduleTemp(helper.calendar, 1),
                "currentTemp": 22,
                "userTargetValue": 30,
                "isUserCustom": true
            });

            backend.recalculate(lastInfoNode, newInfoNode);
            newInfoNode.targetValue.should.be.equal(newInfoNode.userTargetValue, "targetValue should be taken from userTargetValue when user changes the target temperature");
            done();
        });
        describe("User changes", () => {
            var lastInfoNode;
            var newInfoNode;

            before(() => {
                lastInfoNode = _.extend(_.cloneDeep(helper.defaLastInfoNode), {
                    "currentSchedule": backend.getScheduleTemp(helper.calendar),
                    "nextSchedule": backend.getScheduleTemp(helper.calendar, 1),
                    "currentHeaterStatus": "off",
                    "currentTemp": 22,
                    "userTargetValue": 20
                });
                newInfoNode = _.extend(_.cloneDeep(helper.defaNewInfoNode), {
                    "currentSchedule": backend.getScheduleTemp(helper.calendar),
                    "nextSchedule": backend.getScheduleTemp(helper.calendar, 1),
                    "currentTemp": 22,
                    "userTargetValue": 30,
                    "isUserCustom": true
                });
            });

            it('increase temperature by user', (done) => {
                backend.recalculate(lastInfoNode, newInfoNode);
                newInfoNode.targetValue.should.be.equal(newInfoNode.userTargetValue, "targetValue should be taken from userTargetValue");
                newInfoNode.currentHeaterStatus.should.be.equal("on", "heater should be started if user increases it");
                done();
            });

            it('decrese temperature by user', (done) => {
                lastInfoNode = _.cloneDeep(newInfoNode);
                newInfoNode = _.extend(_.cloneDeep(lastInfoNode), {
                    "userTargetValue": 10
                });
                backend.recalculate(lastInfoNode, newInfoNode);
                newInfoNode.targetValue.should.be.equal(newInfoNode.userTargetValue, "targetValue should be taken from userTargetValue");
                newInfoNode.currentHeaterStatus.should.be.equal("off", "heater should be stopped if user decresses it");
                done();
            });

            it('user is setting locked', (done) => {
                lastInfoNode = _.cloneDeep(newInfoNode);
                newInfoNode = _.extend(_.cloneDeep(lastInfoNode), {
                    "isUserCustomLocked": true
                });
                backend.recalculate(lastInfoNode, newInfoNode);
                newInfoNode.targetValue.should.be.equal(lastInfoNode.targetValue, "targetValue shuld not be changed");
                newInfoNode.isUserCustomLocked.should.be.true("isUserCustomLocked should be true");
                done();
            });

            it('calendar is changing', (done) => {
                helper.setMockedDate('2019-05-15T13:01:58.135Z'); //Wednesday
                lastInfoNode = _.cloneDeep(newInfoNode);
                newInfoNode = _.extend(_.cloneDeep(lastInfoNode), {
                    "currentTemp": 25
                });
                backend.recalculate(lastInfoNode, newInfoNode);
                newInfoNode.targetValue.should.be.equal(newInfoNode.userTargetValue);
                done();
            });
        });
    })
});