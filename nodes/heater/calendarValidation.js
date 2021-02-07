var weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
var _ = require('lodash');

function validateCalendar(calendar) {
    var errorMsg = [];
    if (_.intersection(_.keys(calendar), weekDays).length !== 7) {
        throw new Error('Invalid calendar: Missing week days');
    }
    for (var day in calendar) {
        validateWeekDays(day, errorMsg, calendar);
    }
    if (errorMsg.length > 0) {
        var error = new Error('Invalid calendar');
        error.details = errorMsg;
        throw error;
    }
    return _.cloneDeep(calendar);
}

function validateWeekDays(day, errorMsg, calendar) {
    if (!weekDays.includes(day)) {
        errorMsg.push(day + ' - invalid week day naming');
    }
    var timing = calendar[day];
    if (_.keys(timing).length <= 0) {
        errorMsg.push(day + ' -> timing is missing');
    }
    validateTiming(timing, errorMsg, day);
}

function validateTiming(timing, errorMsg, day) {
    for (var time in timing) {
        var value = timing[time];
        var valueMsg = (typeof (value) !== 'number') ? 'temperature needs to be a number' : undefined;
        if (!time.match(/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/g)) {
            errorMsg.push(day + ' -> ' + time + ' - invalid time format (should be HH:mm)' + (valueMsg ? ' and ' + valueMsg : ''));
        } else {
            if (valueMsg)
                errorMsg.push(day + ' -> ' + time + ' - ' + valueMsg);
        }
    }
}

module.exports = {
    check: validateCalendar,
    weekDays: weekDays
}
