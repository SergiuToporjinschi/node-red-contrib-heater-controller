var sinon = require('sinon');
var should = require("should");
var itParam = require('mocha-param');
var helper = require("./testHelper.js");
var HeaterController = require('../nodes/heater/heater');
var tempRising = [];
for (var i = 10.5; i < 30; i = i + 0.5) {
    tempRising.push(i);
}
describe("Testing onSetCalendar", function () {
    var RED = helper.getMockedRED();;
    var hc;
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.spy(RED);
        var HeaterController = helper.getMockedHeaterControllerFaked(require('../nodes/heater/heater'));
        sandbox.spy(HeaterController);
        RED = helper.getMockedRED();
        delete require.cache[require.resolve('../nodes/heater/heater')];
        hc = new HeaterController(RED, {
            group: 'someGroup',
            calendar: JSON.stringify(helper.calendar),
            threshold: 0.5,
            topic: 'heaterStatus'
        });
    })
    afterEach(function () {
        sandbox.restore();
    });
    describe('Invalid week days input', () => {
        itParam("Invalid general format: throws exception", [
            { calendar: undefined, exp: 'Invalid payload' },
            { calendar: 1, exp: 'Invalid payload' },
            { calendar: 'str', exp: 'Invalid payload' },
            { calendar: {}, exp: 'Invalid calendar: Missing week days' },
            { calendar: { somethingElse: 2 }, exp: 'Invalid calendar: Missing week days' },
            { calendar: { monday: 1 }, exp: 'Invalid calendar: Missing week days' },
            { calendar: { Tuesday: '' }, exp: 'Invalid calendar: Missing week days' },
            { calendar: { 'wednesday': {} }, exp: 'Invalid calendar: Missing week days' },
            { calendar: { Friday: 'string' }, exp: 'Invalid calendar: Missing week days' },
            { calendar: { monday: undefined }, exp: 'Invalid calendar: Missing week days' }
        ], (val) => {
            should(() => {
                hc.onSetCalendar({
                    topic: "setCalendar",
                    payload: val.calendar
                });
            }).throw(val.exp);
            should(hc.error.callCount).be.aboveOrEqual(1, "Exception not logged!!!: " + JSON.stringify(val));
        });
        itParam("Invalid timing: throws exception", [{
            "Monday": { //2021-01-35 [1]
                "test": 19,
                "23:59": 19
            },
            "Tuesday": { //2021-01-26 [2]
                1: 23
            },
            "Wednesday": { //2021-01-27 [3]
            },
            "Thursday": { //2021-01-28 [4]
                "06:20": "20",
                "23:59": 19
            },
            "Friday": { //2021-01-29  [5]
                "00:00": true,
            },
            "Saturday": { //2021-01-30 [6]
                "00:00": {},
                "23:59": 19
            },
            "Sunday": { //2021-01-31 [0]
                "23:59": undefined
            }
        }], (val) => {
            should(() => {
                hc.onSetCalendar({
                    topic: "setCalendar",
                    payload: val
                });
            }).throw('Invalid calendar');
            should(hc.error.callCount).be.aboveOrEqual(1, "Exception not logged!!!: " + JSON.stringify(val));
            should(hc.error.getCall(0).firstArg).be.equal('Invalid calendar', "Exception not logged!!!: " + JSON.stringify(val));
            should(hc.error.getCall(0).args[1]).be.Object();
            var errors = hc.error.getCall(0).args[1];
            var dayErrors = [];
            for (var i in errors) {
                dayErrors.push(errors[i].substring(0, errors[i].indexOf(' ')));
            }
            should(dayErrors.length).be.equal(7, "Not all errors are reported: " + JSON.stringify(val));
        });
        var cal = Object.assign({}, helper.calendar);
        var copyThursday = Object.assign({}, cal.Thursday);
        cal['trusday'] = copyThursday;
        itParam("Add another attribute as week day:", [cal], (val) => {
            should(() => {
                hc.onSetCalendar({
                    topic: "setCalendar",
                    payload: val
                });
            }).throw('Invalid calendar');
            should(hc.error.callCount).be.aboveOrEqual(1, "Exception on a valid calendar!!!: " + JSON.stringify(val));
            should(hc.error.getCall(0).args[1][0].indexOf('trusday')).be.aboveOrEqual(0, 'Misspelled week day passes the validation');
        });
        itParam("Valid calendar:", [helper.calendar], (val) => {
            should(() => {
                hc.onSetCalendar({
                    topic: "setCalendar",
                    payload: val
                });
            }).not.throw('Invalid calendar');
            should(hc.error.callCount).not.be.aboveOrEqual(1, "Exception on a valid calendar!!!: " + JSON.stringify(val));
        });
    });
});