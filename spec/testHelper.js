var _ = require("lodash");
var exp = {
    calendar: {
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
    },
    defaLastInfoNode: {
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
    },
    mockedNode: {
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
            // console.log('sendCalled: ');
        }
    },
    setMockedDate: function (dateString) {
        const currentDate = new Date(dateString);
        realDate = Date;
        global.Date = class extends Date {
            constructor(date) {
                if (date) {
                    return super(date);
                }

                return currentDate;
            }
        };
    }
};
exp.defaNewInfoNode = _.cloneDeep(exp.defaLastInfoNode);
module.exports = exp;