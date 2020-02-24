var sinon = require('sinon');
var should = require("should");
require('should-sinon');
var context = {};

var lastInfoNode = {
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

    it('Recalculate', function (done) {
        var backend = new node({
            'group': "test",
            calendar: calendar,
            thresholdRising: 0.5,
            thresholdFalling: 0.5
        }, mockedNode);

        var newInfoNode = {
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

        backend.recalculate(lastInfoNode, newInfoNode);
        newInfoNode.targetValue.should.be.equal(newInfoNode.userTargetValue);
        done();
    });
});