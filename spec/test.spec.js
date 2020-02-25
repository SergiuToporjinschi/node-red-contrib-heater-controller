var sinon = require('sinon');
var should = require("should");
var _ = require("lodash");
require('should-sinon');
var context = {};

var defaLastInfoNode = {
    "currentTemp": 20, //B -> value calculated input from sensor
    "targetValue": 20, //CALC -> Value calculated based on calendar or usr input
    "isUserCustom": false, //-> IB
    "isUserCustomLocked": false, // -> IB
    "userTargetValue": 20, //-> IB
    "currentSchedule": { //-> calendar
        "temp": 20,
        "day": "Monday",
        "time": "00:00"
    },
    "nextSchedule": { //-> calendar
        "temp": 20,
        "day": "Monday",
        "time": "08:00"
    },
    "currentHeaterStatus": "off",
    "time": new Date().toLocaleString()
};
var defaNewInfoNode = _.cloneDeep(defaLastInfoNode);
var mockedNode = {
    'context': {
        context: {},
        'get': function (key) {
            return this.context[key];
        },
        'set': function (key, value) {
            this.context[key] = value;
        }
    },
    'send': function (value) {
        console.log('sendCalled: ');
    }
}
var calendar = {
    "Monday": {
        "00:00": 19,
        "06:20": 22,
        "08:00": 19,
        "16:40": 22,
        "23:59": 19
    },
    "Tuesday": {
        "00:00": 19,
        "06:20": 22,
        "08:00": 19,
        "16:40": 23,
        "23:59": 19
    },
    "Wednesday": {
        "00:00": 19,
        "06:20": 22,
        "08:00": 19,
        "16:40": 22,
        "23:59": 19
    },
    "Thursday": {
        "00:00": 19,
        "06:20": 22,
        "08:00": 19,
        "16:40": 22,
        "23:59": 19
    },
    "Friday": {
        "00:00": 19,
        "06:20": 23,
        "08:00": 19,
        "16:40": 22,
        "23:59": 19
    },
    "Saturday": {
        "00:00": 19,
        "08:00": 20,
        "20:00": 22,
        "23:59": 19
    },
    "Sunday": {
        "00:00": 19,
        "08:00": 20,
        "20:00": 22,
        "23:59": 19
    }
};

describe("Functions", function () {
    var node = require('../backEndNode.js');
    afterEach(function () {
        mockedNode.context.context = {};
    });

    it("Loading node", function (done) {
        var backend = new node({
            'group': "test"
        }, mockedNode);
        backend.defaultInfoNode.should.not.be.undefined();
        backend.defaultInfoNode.should.be.Object();
        backend.defaultInfoNode.should.have.property('targetValue');

        backend.beforeSend.should.be.Function();
        backend.beforeEmit.should.be.Function();
        done();
    });

    it('BeforeEmit backword compatibility', function (done) {
        var backend = new node({
            'group': "test"
        }, mockedNode);

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

        done();
    });

    it('Test getScheduleTemp', function (done) {
        var backend = new node({
            'group': "test",
            calendar: calendar,
            thresholdRising: 0.5,
            thresholdFalling: 0.5
        }, mockedNode);

        var refDate = new Date(Date.parse('2020-02-25T12:00:00')); // Tuesday
        // "Tuesday": {
        //     "00:00": 19,
        //     "06:20": 22,
        //     "08:00": 19,
        //     "16:40": 23,
        //     "23:59": 19
        // },
        var ret = backend.getScheduleTemp(calendar, -1, refDate);
        ret.day.should.be.equal('Tuesday');
        ret.temp.should.be.equal(19);
        ret.time.should.be.equal('08:00');

        ret = backend.getScheduleTemp(calendar, 0, refDate);
        ret.day.should.be.equal('Tuesday');
        ret.temp.should.be.equal(19);
        ret.time.should.be.equal('08:00');

        ret = backend.getScheduleTemp(calendar, 1, refDate);
        ret.day.should.be.equal('Tuesday');
        ret.temp.should.be.equal(23);
        ret.time.should.be.equal('16:40');

        ret = backend.getScheduleTemp(calendar, -2, refDate);
        ret.day.should.be.equal('Tuesday');
        ret.temp.should.be.equal(22);
        ret.time.should.be.equal('06:20');

        var ret = backend.getScheduleTemp(calendar, -100, refDate);
        ret.should.be.empty();
        done();
    });
    // it('Recalculate based on calendar', function (done) {
    //     var backend = new node({
    //         'group': "test",
    //         calendar: calendar,
    //         thresholdRising: 0.5,
    //         thresholdFalling: 0.5
    //     }, mockedNode);
    //     // "Wednesday": {
    //     //     "00:00": 19,
    //     //     "06:20": 22,
    //     //     "08:00": 19,
    //     //     "16:40": 22,
    //     //     "23:59": 19
    //     // },
    //     const currentDate = new Date('2019-05-15T17:01:58.135Z'); //Wednesday
    //     realDate = Date;
    //     global.Date = class extends Date {
    //       constructor(date) {
    //         if (date) {
    //           return super(date);
    //         }
      
    //         return currentDate;
    //       }
    //     };

    //     var infoNode = _.extend(newInfoNode, {
    //         "currentTemp": 25
    //     });

    //     backend.recalculate(lastInfoNode, infoNode);
    //     newInfoNode.currentSchedule.day.should.be.equal("Wednesday");
    //     newInfoNode.currentSchedule.temp.should.be.equal(22);
    //     newInfoNode.currentSchedule.time.should.be.equal("16:40");

    //     newInfoNode.nextSchedule.day.should.be.equal("Wednesday");
    //     newInfoNode.nextSchedule.temp.should.be.equal(19);
    //     newInfoNode.nextSchedule.time.should.be.equal("23:59");

    //     newInfoNode.targetValue.should.be.equal(newInfoNode.currentSchedule.temp);
    //     done();
    // });
    it('Recalculate based on user request', function (done) {
        var backend = new node({
            'group': "test",
            calendar: calendar,
            thresholdRising: 0.5,
            thresholdFalling: 0.5
        }, mockedNode);
        // "Wednesday": {
        //     "00:00": 19,
        //     "06:20": 22,
        //     "08:00": 19,
        //     "16:40": 22,
        //     "23:59": 19
        // },
        const currentDate = new Date('2019-05-15T17:01:58.135Z'); //Wednesday
        realDate = Date;
        global.Date = class extends Date {
          constructor(date) {
            if (date) {
              return super(date);
            }
      
            return currentDate;
          }
        };
        var lastInfoNode = _.extend(_.cloneDeep(defaLastInfoNode), {
            "currentHeaterStatus": "off",
            "currentTemp": 22,
            "userTargetValue": 20
        });
        var newInfoNode = _.extend(_.cloneDeep(defaNewInfoNode), {
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