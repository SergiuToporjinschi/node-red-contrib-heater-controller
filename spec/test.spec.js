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

    it("Loading node", function (done) {

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

    it('BeforeEmit backword compatibility', function (done) {
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

    it('Test getScheduleTemp', function (done) {
        var backend = new node({
            'group': "test",
            calendar: helper.calendar,
            thresholdRising: 0.5,
            thresholdFalling: 0.5
        }, helper.mockedNode);

        // var refDate = new Date(Date.parse('2020-02-25T12:00:00')); // Tuesday
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
    it('Recalculate based on calendar', function (done) {
        var backend = new node({
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

        var infoNode = _.extend(_.cloneDeep(helper.defaNewInfoNode), {
            "currentTemp": 25
        });

        backend.recalculate(helper.defaLastInfoNode, infoNode);
        infoNode.currentSchedule.day.should.be.equal("Wednesday");
        infoNode.currentSchedule.temp.should.be.equal(22);
        infoNode.currentSchedule.time.should.be.equal("16:40");

        infoNode.nextSchedule.day.should.be.equal("Wednesday");
        infoNode.nextSchedule.temp.should.be.equal(19);
        infoNode.nextSchedule.time.should.be.equal("23:59");

        infoNode.targetValue.should.be.equal(infoNode.currentSchedule.temp);
        done();
    });
    it('Recalculate based on user request', function (done) {
        var backend = new node({
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
        var lastInfoNode = _.extend(_.cloneDeep(helper.defaLastInfoNode), {
            "currentHeaterStatus": "off",
            "currentTemp": 22,
            "userTargetValue": 20
        });
        var newInfoNode = _.extend(_.cloneDeep(helper.defaNewInfoNode), {
            "currentTemp": 22,
            "userTargetValue": 30,
            "isUserCustom": true
        });

        backend.recalculate(lastInfoNode, newInfoNode);
        newInfoNode.currentSchedule.day.should.be.equal("Wednesday");
        newInfoNode.currentSchedule.temp.should.be.equal(22);
        newInfoNode.currentSchedule.time.should.be.equal("16:40");

        newInfoNode.nextSchedule.day.should.be.equal("Wednesday");
        newInfoNode.nextSchedule.temp.should.be.equal(19);
        newInfoNode.nextSchedule.time.should.be.equal("23:59");

        newInfoNode.targetValue.should.be.equal(newInfoNode.currentSchedule.temp);
        done();
    });
});