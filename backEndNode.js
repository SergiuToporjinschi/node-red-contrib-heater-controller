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
    this.log = nodeFn.log;
    this.warn = nodeFn.warn;

    var info = _.extend(this.defaultInfoNode, this.context.get('infoNode') || {});
    this.context.set('infoNode', info);
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
backEndNode.prototype.getScheduleTemp = function (calendar, offset, date) {
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
    if (index < 0) {
        return {
        };
    }
    return {
        temp: calDay[times[index]],
        day: weekDay,
        time: times[index]
    };
};
/*
{
   "topic":"",
   "payload":{
      "currentTemp":23, B -> value calculated input from sensor
      "targetValue":22, CALC -> Value calculated based on calendar or usr input
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
 */
backEndNode.prototype.calculateTarget = function (lastInfoNode, newInfoNode) {
    /** is true if the schedule has changed */
    var changedBySchedule = lastInfoNode.currentSchedule.temp !== newInfoNode.currentSchedule.temp || lastInfoNode.currentSchedule.day !== newInfoNode.currentSchedule.day || lastInfoNode.currentSchedule.time !== newInfoNode.currentSchedule.time;

    //changed by schedule and it was not locked by user
    if (
        (changedBySchedule && !lastInfoNode.isUserCustomLocked) || //changed by calendar
        (!changedBySchedule && lastInfoNode.isUserCustom && !newInfoNode.isUserCustom)
    ) {
        this.log("ResetToCalendar || changedByCalendar");
        newInfoNode.targetValue = newInfoNode.currentSchedule.temp;
        newInfoNode.isUserCustom = false;
    } else if (newInfoNode.isUserCustom) {
        this.log("ChangedByUser");
        newInfoNode.targetValue = newInfoNode.userTargetValue;
    } else if (!newInfoNode.targetValue) {
        newInfoNode.targetValue = newInfoNode.currentSchedule.temp;
        newInfoNode.isUserCustom = false;
    } else {
        return false;
    }
    return true;
}

backEndNode.prototype.recalculate = function (lastInfoNode, newInfoNode) {
    newInfoNode.currentSchedule = this.getScheduleTemp(this.config.calendar);
    newInfoNode.nextSchedule = this.getScheduleTemp(this.config.calendar, 1);

    //maybe can be removed
    if (!this.calculateTarget(lastInfoNode, newInfoNode)) {
        this.error('Invalid state: target temperature and customer locking is active');
        return undefined;
    }

    var difference = (newInfoNode.targetValue - newInfoNode.currentTemp);
    var newHeaterStatus = (difference < 0 ? "off" : "on");
    var threshold = (newHeaterStatus === "off" ? this.config.thresholdRising : this.config.thresholdFalling);
    var changeStatus = (Math.abs(difference) >= threshold);
    if (changeStatus) {
        newInfoNode.currentHeaterStatus = newHeaterStatus;
    }
    return newInfoNode;
}



backEndNode.prototype.logChanges = function (newValues) {
    if (this.config.logLength > 0) {
        var logs = this.context.get("logs") || [];
        newValues.time = new Date().toLocaleString();
        logs.push(JSON.parse(JSON.stringify(newValues)));
        this.context.set("logs", logs);
    }
};



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

//BACK toFront
backEndNode.prototype.beforeEmit = function (msg, value) {
    // var context = this.node.context();
    var infoNode = this.context.get("infoNode");
    var newInfoNode = JSON.parse(JSON.stringify(infoNode));
    /**backword compatibility */
    if (msg.topic === 'currentTemp') {
        value = { 'currentTemp': value };
        msg.topic = "userConfig";
    }

    if (msg.topic === 'userTargetValue') {
        value = { 'userTargetValue': value };
        msg.topic = "userConfig";
    }
    if (msg.topic === 'isUserCustomLocked') {
        value = { 'isUserCustomLocked': value };
        msg.topic = "userConfig";
    }


    if (msg.topic === 'userConfig') {
        //filter incomming properties to allow only those that can be changed by message
        var changedProp = _.pick(value, ['isUserCustom', 'isUserCustomLocked', 'userTargetValue', 'currentTemp']);
        newInfoNode = _.extend(newInfoNode, changedProp);
        this.recalculate(infoNode, newInfoNode);
    }

    if (newInfoNode.currentHeaterStatus != infoNode.currentHeaterStatus) {
        this.logChanges(newInfoNode);
    }
    this.context.set("infoNode", newInfoNode);

    this.send({
        topic: this.config.topic,
        payload: newInfoNode
    });
    return { msg: newInfoNode };
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
            var oldInfoNode = this.context.get("infoNode");
            // var changedProp = _.pick(value, ['isUserCustom', 'isUserCustomLocked', 'userTargetValue', 'currentTemp']);
            var newInfoNode = _.extend(JSON.parse(JSON.stringify(oldInfoNode)), orig.msg);
            this.recalculate(oldInfoNode, newInfoNode);
            this.context.set("infoNode", newInfoNode);

            //update interface;
            _.extend(orig.msg, newInfoNode);

            // var result = this.recalculate(orig.msg, this.config);
            if (newInfoNode) {
                return {
                    payload: newInfoNode,
                    topic: this.config.topic
                };
                // var newValues = override(this.context.get("values") || {}, result); //merge user changes and store them in context
                // this.context.set("values", newValues); //Store in context
                // this.logChanges(this.node, newValues);
                // return [{
                //     payload: newValues,
                //     topic: this.config.topic
                // }, undefined];
            } else {
                return [undefined, undefined];
            }
        }
    }
};

module.exports = backEndNode;