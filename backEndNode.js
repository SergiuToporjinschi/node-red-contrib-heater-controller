'use strict';
var _ = require('lodash');
function backEndNode(config, nodeFn) {
    if (!config || !config.hasOwnProperty("group")) {
        throw 'heater_controller.error.no-group';
    }
    this.allowedTopics = ['currentTemp', 'userTargetValue', 'setCalendar', "isUserCustomLocked", "userConfig"];
    this.config = config;
    this.context = nodeFn.context;
    this.send = nodeFn.send;
    this.error = nodeFn.error;
}

/** make it gone */
backEndNode.prototype.override = function (target, source) {
    return Object.assign(target, source);
}

/**
 * Returns an scheduled event from calendar
 * @param {Calendar} calendar the calendar configuration
 * @param {int} offset a negative or positive offset, if is -1 will return the value of the previouse sechedule event if is +1 will return the next schedule event
 */
backEndNode.prototype.getScheduleTemp = function (calendar, offset) {
    var timeNow = ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2);
    var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekDay = weekDays[new Date().getDay()];
    var calDay = calendar[weekDay];
    var times = Object.keys(calDay);
    if (!calDay[timeNow]) {
        times.push(timeNow);
        times.sort();
        if (!offset) {
            offset = -1;
        }
    }
    var index = times.indexOf(timeNow) + (offset || 0);
    var ret = {
        temp: calDay[times[index]],
        day: weekDay,
        time: times[index],
    };
    return ret;
};
/*
{
   "topic":"",
   "payload":{
      "currentTemp":23, B
      "targetValue":22, CALC
      "isUserCustom":false, -> IB
	  "isUserCustomLocked" : true, ->IB
	  "userTargetValue": 23.5 -> IB
      "currentSchedule":{ -> calendar
         "temp":22,
         "day":"Wednesday",
         "time":"16:40"
      },
      "nextSchedule":{ ->calendar
         "temp":19,
         "day":"Wednesday",
         "time":"23:59"
      },
      "currentHeaterStatus":"off", CALC
      "time":"2/5/2020, 10:02:30 PM"
   },
   "_msgid":"28d1c13e.20ae7e"
}

calendar = 10

/**
 * Decides if we should turn on or off the heater;
 * @param {currentSettings} status current information about stauts of controller
 * @param {trashhold} threshold Trashsold to be able to calculate the new status of heater
 */
backEndNode.prototype.recalculateAndTrigger = function (status) {
    var currentSchedule = this.getScheduleTemp(this.config.calendar);
    var lastSchedule = status.currentSchedule;
    var changedSchedule = !lastSchedule || currentSchedule.temp !== lastSchedule.temp || currentSchedule.day !== lastSchedule.day || currentSchedule.time !== lastSchedule.time;
    if ((changedSchedule && status.isUserCustom && !status.isUserCustomLocked) || !status.isUserCustom) {
        status.targetValue = currentSchedule.temp;
        status.isUserCustom = false;
    } else if (status.isUserCustom) {
        status.targetValue = status.userTargetValue;
    } else if (!status.targetValue) {
        status.targetValue = status.currentSchedule.temp;
        status.isUserCustom = false;
    } else {
        this.error('Invalid state: target temperature and customer locking is active');
        return undefined;
    }

    if (status.targetValue === undefined || status.currentTemp === undefined) {
        this.error('Missing: ' + (status.currentTemp === undefined ? 'currentTemp ' : ' ') + (status.targetValue === undefined ? 'targetValue' : ''));
        return undefined;
    }
    status.currentSchedule = currentSchedule;
    status.nextSchedule = this.getScheduleTemp(config.calendar, 1);

    var difference = (status.targetValue - status.currentTemp);
    var newHeaterStatus = (difference < 0 ? "off" : "on");
    var threshold = (newHeaterStatus === "off" ? config.thresholdRising : config.thresholdFalling);
    var changeStatus = (Math.abs(difference) >= threshold);
    if (changeStatus) {
        status.currentHeaterStatus = newHeaterStatus;
    }
    return status;
};

backEndNode.prototype.logChanges = function (node, newValues) {
    if (node.config.logLength > 0) {
        var logs = node.context().get("logs") || [];
        newValues.time = new Date().toLocaleString();
        logs.push(JSON.parse(JSON.stringify(newValues)));
        node.context().set("logs", logs);
    }
};

backEndNode.prototype.recalculate = function (lastInfoNode, newInfoNode) {
    newInfoNode.currentSchedule = this.getScheduleTemp(this.config.calendar);
    newInfoNode.nextSchedule = this.getScheduleTemp(this.config.calendar, 1);

    /** is true if the schedule has changed */
    var changedBySchedule = lastInfoNode.currentSchedule.temp !== newInfoNode.currentSchedule.temp || lastInfoNode.currentSchedule.day !== newInfoNode.currentSchedule.day || lastInfoNode.currentSchedule.time !== newInfoNode.currentSchedule.time;
    if (changedBySchedule && !newInfoNode.isUserCustomLocked) { //changed by schedule
        /** Set temperature based on user preference or calendar */
        newInfoNode.targetValue = newInfoNode.currentSchedule.temp;
    } else if (changedBySchedule && !newInfoNode.isUserCustom) { //changed by schedule
        /** Set temperature based on user preference or calendar */
        newInfoNode.targetValue = newInfoNode.currentSchedule.temp;
    }


}


backEndNode.prototype.getAdaptedConfig = function () {
    try {
        this.config.calendar = JSON.parse(this.config.calendar);
    } catch (err) {
        this.config.calendar = this.config.calendar;
    }
    return this.config;
};

backEndNode.prototype.defaultInfoNode = {
    "currentTemp": 20,
    "targetValue": 20,
    "isUserCustom": false,
    "isUserCustomLocked": false,
    "userTargetValue": 20,
    "currentSchedule": {
        "temp": 20,
        "day": "Monday",
        "time": "00:00"
    },
    "nextSchedule": {
        "temp": 20,
        "day": "Monday",
        "time": "08:00"
    },
    "currentHeaterStatus": "off",
    "time": new Date().toLocaleString()
};

backEndNode.prototype.getWidget = function () {
    var frontConf = {
        calendar: this.config.calendar,
        unit: this.config.unit,
        title: this.config.title,
        displayMode: this.config.displayMode,
        sliderStep: this.config.sliderStep,
        sliderMinValue: this.config.sliderMinValue,
        sliderMaxValue: this.config.sliderMaxValue
    }
    var frontEnd = require('./frontEnd').init(frontConf);
    var html = frontEnd.getHTML();

    var me = this;
    /** initialize infoNode */
    var info = _.extend(this.defaultInfoNode, this.context.get('infoNode') || {});
    this.context.set('infoNode', info);

    return {
        format: html,
        templateScope: "local",
        emitOnlyNewValues: false,
        forwardInputMessages: false,
        storeFrontEndInputAsState: true,
        initController: frontEnd.getController,
        convertBack: function (value) {
            return value
        },
        beforeEmit: function () { return me.beforeEmit.apply(me, arguments); },
        beforeSend: function () { return me.beforeSend.apply(me, arguments); }
    };
}
//BACK toFront
backEndNode.prototype.beforeEmit = function (msg, value) {
    // var context = this.node.context();
    var infoNode = this.context.get("infoNode");
    var newInfoNode = JSON.parse(JSON.stringify(infoNode));
    /**backword compatibility */
    // if (msg.topic === 'currentTemp') {
    //     value = { 'currentTemp': value };
    //     msg.topic = "userConfig";
    // }
    if (msg.topic === 'userConfig') {
        //filter incomming properties to allow only those that can be changed by message
        var changedProp = _.pick(value, ['isUserCustom', 'isUserCustomLocked', 'userTargetValue', 'currentTemp']);
        newInfoNode = _.extend(newInfoNode, changedProp);
        this.recalculate(infoNode, newInfoNode);
    }

    var existingValues = this.context.get("values") || {};
    if (this.allowedTopics.indexOf(msg.topic) < 0) { //if topic is not a safe one just trigger a refresh of UI
        return { msg: existingValues }; //return what I already have
    }
    //in case we need more topics we have to see if we should convert value
    var returnValues = existingValues;
    switch (msg.topic) {
        case 'userConfig':
            // if (value.isUserCustomLocked !== undefined) {
            //     returnValues = override(existingValues, { 'isUserCustomLocked': value.isUserCustomLocked });
            //     returnValues.isUserCustomLocked = value.isUserCustomLocked;
            //     context.set("values", returnValues);
            // }
            // if (value.userTargetValue !== undefined) {
            //     var inValue = parseFloat(value.userTargetValue);
            //     returnValues = override(existingValues, { 'userTargetValue': inValue });
            //     returnValues.isUserCustom = true;
            //     context.set("values", returnValues);
            // }
            // if (value.isUserCustom !== undefined) {
            //     returnValues = override(existingValues, { 'isUserCustom': value.isUserCustom });
            //     returnValues.isUserCustom = value.isUserCustom;
            //     context.set("values", returnValues);
            // }

            break;
        case 'setCalendar':
            this.config.calendar = value;
            returnValues = this.override(existingValues, { "calendar": value });
            if (this.config.currentTemp) {
                returnValues = this.recalculateAndTrigger(returnValues, this.config, this.node);
            }
            this.context.set("values", returnValues);
            break;
        // //DEPRECATED
        // case 'isUserCustomLocked':
        //     returnValues = this.override(existingValues, { 'isUserCustomLocked': value });
        //     this.context.set("values", returnValues);
        //     returnValues.isUserCustomLocked = value;
        //     break;
        // //DEPRECATED
        // case 'userTargetValue':
        //     value = parseFloat(value);
        //     returnValues = this.override(existingValues, { 'userTargetValue': value });
        //     returnValues.isUserCustom = true;
        //     break;
        case 'currentTemp':
            value = parseFloat(value);
            returnValues = this.override(existingValues, { 'currentTemp': value });
            this.context.set("values", returnValues);
            break;
    }
    var oldStatus = existingValues.currentHeaterStatus;
    returnValues = this.recalculateAndTrigger(returnValues, this.config);
    this.context.set("values", returnValues);
    if (returnValues.currentHeaterStatus != oldStatus) {
        this.logChanges(this.node, returnValues);
    }
    // returnValues.logs = this.node.context().get('logs');
    this.node.send({
        topic: this.config.topic,
        payload: returnValues
    });
    return { msg: returnValues };
};

//BACK frontToBack
backEndNode.prototype.beforeSend = function (msg, orig) {
    if (orig) {
        if (orig.msg.action === 'showLogs') {
            delete orig.msg.action;
            var logs = this.context.get("logs") || [];
            return [undefined, {
                payload: logs,
                topic: 'logs'
            }];
        } else {
            var oldStatus = orig.msg.currentHeaterStatus;
            var result = this.recalculateAndTrigger(orig.msg, this.config);
            if (result && result.currentHeaterStatus != oldStatus) {
                var newValues = override(this.context.get("values") || {}, result); //merge user changes and store them in context
                this.context.set("values", newValues); //Store in context
                this.logChanges(this.node, newValues);
                return [{
                    payload: newValues,
                    topic: this.config.topic
                }, undefined];
            } else {
                return [undefined, undefined];
            }
        }
    }
};

module.exports = backEndNode;