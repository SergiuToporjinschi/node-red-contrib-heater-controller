'use strict';
function backEndNode(node, config) {
    if (!config || !config.hasOwnProperty("group")) {
        throw 'heater_controller.error.no-group';
    }
    this.node = node;
    this.allowedTopics = ['currentTemp', 'currentHeaterStatus'];
    this.config = config;
}

// TODO maybe I should replace this method or remove it
function storeInContext(node, value) {
    var context = node.context();
    var values = context.get("values") || {};
    for (var i in value) {
        values[i] = value[i];
    }
    context.set("values", values);
    return values;
}
function storeKeyInContext(node, key, value) {
    var context = node.context();
    var values = context.get("values") || {};
    if (key && value) {
        values[key] = value;
    }
    context.set("values", values);
    return values;
}

function getScheduleTemp(calendar, offset) {
    var timeNow = ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2);
    var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var calDay = calendar[weekDays[new Date().getDay()]];
    if (calDay[timeNow] && !offset) { //maybe I'm lucky
        return calDay[timeNow];
    } else {
        var times = Object.keys(calDay);
        times.push(timeNow);
        times.sort();
        if (!offset) {
            return calDay[times[times.indexOf(timeNow) - 1]];
        } else {
            var time = times[times.indexOf(timeNow) + offset];
            return calDay[times[times.indexOf(timeNow) + offset]] + '&deg;C (' + time + ')';
        }
    }
};

/**
 * Decides if we should turn on or off the heater;
 * @param {currentSettings} status current information about stauts of controller
 * @param {trashhold} threshold Trashsold to be able to calculate the new status of heater
 */
function recalculateAndTrigger(status, thresholdRising, thresholdFalling, node) {
    status.targetValue = status.targetValue || status.currentCalTarget;
    if (status.targetValue === undefined || status.currentTemp === undefined) {
        node.error('Missing: ' + (status.currentTemp === undefined ? 'currentTemp ' : ' ') + (status.targetValue === undefined ? 'targetValue' : ''));
        return undefined;
    }
    var difference = (status.targetValue - status.currentTemp);
    var newHeaterStatus = (difference < 0 ? "off" : "on");
    var threshold = (newHeaterStatus === "off" ? thresholdRising : thresholdFalling);
    var changeStatus = (Math.abs(difference) >= threshold);
    if (changeStatus != status.currentHeaterStatus) {
        status.currentHeaterStatus = newHeaterStatus;
    }
    return status;
};

backEndNode.prototype.getAdaptedConfig = function () {
    this.config.calendar = JSON.parse(this.config.calendar);
    return this.config;
}
backEndNode.prototype.getWidget = function () {
    var temp = getScheduleTemp(this.config.calendar);
    var nextCalTemp = getScheduleTemp(this.config.calendar, 1);
    var frontEnd = require('./frontEnd').init(this.config, temp, nextCalTemp);
    var html = frontEnd.getHTML();
    var me = this;
    return {
        format: html,
        templateScope: "local",
        emitOnlyNewValues: false,
        forwardInputMessages: false,
        storeFrontEndInputAsState: true,
        initController: frontEnd.getController,
        beforeEmit: function () { return me.beforeEmit.apply(me, arguments); },
        beforeSend: function () { return me.beforeSend.apply(me, arguments); }
    };
}

backEndNode.prototype.beforeEmit = function (msg, value) {
    if (this.allowedTopics.indexOf(msg.topic) < 0) { //if topic is not a safe one just trigger a refresh of UI
        return { msg: storeKeyInContext(this.node) }; //return what I already have
    }

    var returnValues = storeKeyInContext(this.node, msg.topic, value);
    if ('currentTemp' === msg.topic) {
        returnValues.currentCalTarget = getScheduleTemp(this.config.calendar);
        returnValues = recalculateAndTrigger(returnValues, this.config.thresholdRising, this.config.thresholdFalling, this.node);
        this.node.send({ payload: returnValues });
    }
    return { msg: returnValues };
};

backEndNode.prototype.beforeSend = function (msg, orig) {
    if (orig) {
        var result = recalculateAndTrigger(orig.msg, this.config.thresholdRising, this.config.thresholdFalling, this.node);
        if (result) {
            return { payload: storeInContext(this.node, result) };
        } else {
            return undefined;
        }
    }
};

module.exports = backEndNode;