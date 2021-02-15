var _ = require("lodash");
const { fake } = require("sinon");
var sinon = require('sinon');
var exp = {
    configEx: {
        calendar:'{\n    "Monday": {\n        "00:00": 19,\n        "06:20": 22,\n        "08:00": 19,\n        "16:40": 22,\n        "23:59": 19\n    },\n    "Tuesday": {\n        "00:00": 19,\n        "06:20": 22,\n        "08:00": 19,\n        "16:40": 22,\n        "23:59": 19\n    },\n    "Wednesday": {\n        "00:00": 19,\n        "06:20": 22,\n        "08:00": 19,\n        "16:40": 22,\n        "23:59": 19\n    },\n    "Thursday": {\n        "00:00": 19,\n        "06:20": 22,\n        "08:00": 19,\n        "16:40": 22,\n        "23:59": 19\n    },\n    "Friday": {\n        "00:00": 19,\n        "06:20": 23,\n        "08:00": 19,\n        "16:40": 22,\n        "23:59": 19\n    },\n    "Saturday": {\n        "00:00": 19,\n        "08:00": 20,\n        "20:00": 22,\n        "23:59": 19\n    },\n    "Sunday": {\n        "00:00": 19,\n        "08:00": 20,\n        "20:00": 22,\n        "23:59": 19\n    }\n}',
        displayMode:'buttons',
        g:'d2d20a7c.2b2bc8',
        group:'add64240.8d8c9',
        height: 4,
        testFunction: function () { },
        id:'cf35eb5f.d228c8',
        info:'Description',
        inputLabels: ['currentTemp | userCofig | setCalendar'],
        logLength:1,
        logLengthType:'days',
        name:'Heater setting currentTemp',
        order:0,
        outputLabels: ['Heater status', 'Computation status'],
        sliderMaxValue:35,
        sliderMinValue:10,
        sliderStep:0.5,
        threshold:0.5,
        title:'Heater',
        topic:'heaterStatus',
        type:'ui_heater_controller',
        unit:'C',
        width:6,
        wires: [[1,23,4], '23'],
        x:520,
        y:480,
        z:'869218bd.a018c8'
    },
    calendar: {
        "Monday": { //2021-01-35 [1]
            "00:00": 19,
            "06:20": 22,
            "08:00": 19,
            "16:40": 22,
            "23:59": 19
        },
        "Tuesday": { //2021-01-26 [2]
            "00:00": 19,
            "06:20": 22,
            "08:00": 19,
            "16:40": 23,
            "23:59": 19
        },
        "Wednesday": { //2021-01-27 [3]
            "00:00": 19,
            "06:20": 22,
            "08:00": 19,
            "16:40": 22,
            "23:59": 19
        },
        "Thursday": { //2021-01-28 [4]
            "00:00": 19,
            "06:20": 10,
            "08:00": 19,
            "16:40": 22,
            "23:59": 19
        },
        "Friday": { //2021-01-29  [5]
            "00:00": 19,
            "06:20": 23,
            "08:00": 19,
            "16:40": 22,
            "23:59": 19
        },
        "Saturday": { //2021-01-30 [6]
            "00:00": 19,
            "08:00": 20,
            "20:00": 22,
            "23:59": 19
        },
        "Sunday": { //2021-01-31 [0]
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
        "isLocked": false, // -> IB
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
    getMockedRED: function (params) {
        var Red = {
            server: {
                on: function () { }
            },
            settings: {
                httpNodeRoot: '/'
            },
            nodes: {
                createNode: sinon.fake()
            }
        };
        Red.require = sinon.stub();
        var addWidgetStub = sinon.stub();
        var isDarkStub = sinon.stub().returns(false);
        var getThemeStub = sinon.stub().returns({});
        var constrUI = sinon.stub();
        addWidgetStub.returns(sinon.fake());
        constrUI.returns({ addWidget: addWidgetStub, isDark : isDarkStub, getTheme: getThemeStub });
        Red.require.withArgs('node-red-dashboard').returns(constrUI);
        return Red;
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
        'send': () => { },
        'error': () => { },
        'log': () => { },
        'warn': () => { },
        'send': () => { }
    },
    searchForStatusNode() {

    },
    getMockedHeaterControllerFaked: function (hc) {
        hc = this.getMockedHeaterController(hc, sinon.fake(), sinon.fake(), sinon.fake(), sinon.fake(), sinon.fake());
        hc.prototype.context = sinon.fake.returns({ set: sinon.fake() });
        hc.prototype.receive = sinon.fake.returns();
        hc.prototype.id = 'heaterID1';
        return hc;
    },
    getMockedHeaterController: function (hc, onFunc, contextFunc, debugFunc, logFunc, errorFunc) {
        hc.prototype.on = onFunc || function (params) { };
        hc.prototype.context = contextFunc || function (params) { return { set: function (params) { } } };
        hc.prototype.debug = debugFunc || function (params) { };
        hc.prototype.log = logFunc || function (params) { };
        hc.prototype.error = errorFunc || function (params) { };
        return hc;
    },
    getOffSetInHHMM: function () {
        var offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
        return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
    },
    setMockedDate: function (dateString) {
        var sinon = require('sinon');
        require('sinon');
        clock = sinon.useFakeTimers({
            now: new Date(dateString + this.getOffSetInHHMM()),
            shouldAdvanceTime: false
        });
        // const spy = sinon.
        //     .spyOn(global, 'Date')
        //     .mockImplementation(() => mockDate);
        return clock;

        // const currentDate = new Date(dateString);
        // realDate = Date;
        // global.Date = class extends Date {
        //     constructor(date) {
        //         if (date) {
        //             return super(date);
        //         }

        //         return currentDate;
        //     }
        // };
    }
};
exp.defaNewInfoNode = _.cloneDeep(exp.defaLastInfoNode);
module.exports = exp;