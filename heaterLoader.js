var UINode = require('./uINode')
class Heater extends UINode {
    constructor(RED, config) {
        super(RED, config)
        this.log('Heater Constructor')
        if (typeof (this.config) !== 'object' || !this.config.hasOwnProperty('group') || typeof (this.config.group) !== 'string') {
            this.error('Missing configuration or group!!!');
            throw Error('Missing configuration or group');
        }
        this.config.calendar = JSON.parse(this.config.calendar);
        this.initCurrentState();
        this.initTopics();
    }

    initTopics() {
        this.addEvent('currentTemp', this.onTempChange); //this topic changes currentTemperature (WE MUST RECEIVE THIS MESSAGE)
        this.addEvent('userConfig', this.onUserConfig);//this topic can be used to change user settings, isUserCustomLocked, userTargetValue
        this.addEvent('setCalendar', this.onSetCalendar); //this topic can be used to change current calendar
    }
    initCurrentState() {
        var node = this;
        this.status = {
            "currentTemp": undefined, //Current room temperature
            "targetValue": undefined, //Target temperature for the room
            "isUserCustom": false, //Is targetValue a user custom value?
            "isLocked": false, //Is targetValue locked (locker is true)
            "userTargetValue": undefined, //Target temperature set by user
            "currentSchedule": undefined, //Current target temperature from scheduler for this moment
            "nextSchedule": undefined, //Next target temperature from scheduler for next change
            "currentHeaterStatus": undefined, //Is heater running?
            "time": new Date().toLocaleString(),
            set _currentTemp(val) {
                var changed = this.currentTemp != val;
                this.currentTemp = val;
                this.time = new Date().toLocaleString();
                if (changed) { node.context().set('status', this); }
            },
            set _targetValue(val) {
                var changed = this.targetValue != val;
                this.targetValue = val;
                this.time = new Date().toLocaleString();
                if (changed) { node.context().set('status', this); }
            },
            set _isUserCustom(val) {
                this.isUserCustom = val;
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            },
            set _isUserCustomLocked(val) {
                this.isUserCustomLocked = val;
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            },
            set _userTargetValue(val) {
                this.targetValue = val;
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            },
            set _currentSchedule(val) {
                this.currentSchedule = val;
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            },
            set _nextSchedule(val) {
                this.nextSchedule = val;
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            },
            set _currentHeaterStatus(val) {
                this.currentHeaterStatus = val;
                this.time = new Date().toLocaleString();
                this.time = new Date().toLocaleString();
                node.context().set('status', this);
            }
        }
        this.status.currentSchedule = this.getScheduleOffSet();
        this.status.nextSchedule = this.getScheduleOffSet(1);
    }

    onTempChange(msg) {
        //console.log('currentTemp');
        if (typeof (msg) !== 'object' || typeof (msg.payload) !== 'number') {
            this.error("onTempChange->Invalid payload [" + JSON.stringify(msg) + "]");
            throw new Error('Invalid payload');
        }

        this.status._currentTemp = msg.payload;

        //update schedulers
        this.status.currentSchedule = this.getScheduleOffSet();
        this.status.nextSchedule = this.getScheduleOffSet(1);

        //recalculate status
        var calculatedStatus = this.recalculate();
        // TODO return messages;
        this.send({ topic: this.config.topic, payload: calculatedStatus });
        return [{ 'topic': 'status', 'payload:': this.status }];
    }

    onUserConfig(msg) {
        if (msg.hasOwnProperty('isUserCustomLocked') || msg.hasOwnProperty('userTargetValue')) {
            //TODO check msg option and take only isUserCustomLocked, isUserCustom, and userTargetValue
            //TODO change this.status with msg.isUserCustomLocked and msg.userTargetValue
            //TODO if message contain isUserCustomLocked = false then forget about the others and locked the temperature until next change
        }
    }

    onSetCalendar(msg) {
        //TODO check if calendar is valid;
        //TODO replace this.config.calendar with msg;
    }

    onInput() {
        //console.log('onInput');
    }

    /**
     * Returns the code for a specific offset
     * @param {Number} offSet the number of days as offset, can be undefined == 0
     * @param {Array} weekDays an array with all the week days names
     */
    getSearchedInterval(offSet, weekDays) {
        var intervalList = [];
        for (var i in this.config.calendar) {
            var dayId = weekDays.indexOf(i);;
            for (var j in this.config.calendar[i]) {
                intervalList.push(dayId + j.replace(":", ""));
            }
        }
        intervalList.sort();
        var nowCode = new Date().getDay() + ("0" + new Date().getHours()).slice(-2) + ("0" + new Date().getMinutes()).slice(-2);
        var isInInterval = intervalList.indexOf(nowCode) >= 0;
        var currentPoz = intervalList.indexOf(nowCode);
        if (!isInInterval) {
            intervalList.push(nowCode);
            intervalList.sort();
            currentPoz = intervalList.indexOf(nowCode);
            intervalList.splice(currentPoz, 1);
            offSet--;
        }
        currentPoz = currentPoz + offSet;

        if (currentPoz < 0) currentPoz = intervalList.length - Math.abs(currentPoz);
        return intervalList[currentPoz];



        //if the current time is not matching with one that is set in calendar, off set si adjusted because I have also my position there
        // if (!isInInterval && offSet === -1) offSet--;

        // //if you reached to the bottom and you have to search from the top
        // if (offSet > intervalList.length - 1) offSet = offSet - (intervalList.length - 1);
        // var poz = currentPoz + (offSet || -1);

        // //if is starting of the list and you have to search it from the bottom
        // if (poz < 0) {
        //     poz = intervalList.length - 1 - Math.abs(poz);
        // }
        // return intervalList[poz]
    }

    /**
     * Calculates temperature for a specific interval
     *  @param {Object} userOffset An object with temperature for a specific time interval
     * {
     * temp : temperature,
     * time: starting time interval hh:mm
     * day: the week day name;
     * }
     */
    getScheduleOffSet(userOffset) {
        var weekDays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        var intervalCode = this.getSearchedInterval(userOffset || 0, weekDays);
        var weekDay = intervalCode[0];
        var time = intervalCode.substr(1).substr(0, 2) + ":" + intervalCode.substr(1).substr(2);

        var retObj = {
            time: time
        }
        retObj.day = weekDays[weekDay];
        retObj.temp = this.config.calendar[retObj.day][time];
        return retObj;
    }

    calculateStatus(targetValue) {
        if (this.status.currentTemp >= (this.config.threshold + targetValue)) {
            this.status.currentHeaterStatus = "off";
        } else if (this.status.currentTemp <= (targetValue - this.config.threshold)) {
            this.status.currentHeaterStatus = "on";
        }

        //if currentTemp = 5, target = 5, threshold != 0 then there is a possibility for having no choice but keep the initial status
        //if there is no initial status then set it to OFF very very very low probability
        return this.status.currentHeaterStatus || this.oldStatus.currentHeaterStatus || 'off';
    }

    recalculate() {
        if (typeof (this.status) === 'undefined' || typeof (this.status.currentTemp) !== "number") {
            this.debug("Recalculate: no current temperature!!!");
            return;
        }
        if (typeof (this.status.currentSchedule) !== "object") {
            this.debug("Recalculate: no schedule!!!");
            return;
        }

        //first currentTemp will not be in old status, meaning is first set of currentTemp
        var forced_ByScheduler = this.oldStatus.currentTemp === undefined;

        //Schedule has been changed but the targetTemperature is locked, only currentTemp can change the status
        //I know that I could merge those if's but I want to keep it very simple
        if (!forced_ByScheduler && this.status.isLocked) {
            this.status.targetValue = this.status.userTargetValue;
            return this.calculateStatus(this.status.targetValue);
        }

        //if is not locked; Can be changed by calendar?
        var scheduleChanged = this.status.currentSchedule.temp !== this.oldStatus.currentSchedule.temp ||
            this.status.currentSchedule.day !== this.oldStatus.currentSchedule.day ||
            this.status.currentSchedule.time !== this.oldStatus.currentSchedule.time;


        //Schedule has been changed
        if (forced_ByScheduler || scheduleChanged) {
            this.status.targetValue = this.status.currentSchedule.temp;
            var heaterNewStatus = this.calculateStatus(this.status.targetValue);
            if (heaterNewStatus != this.oldStatus.currentHeaterStatus) {
                this.status.isUserCustom = false;
            }
            return heaterNewStatus;
        }

        //Scheduler is not changing the temp but is user custom
        if (this.status.isUserCustom) {
            this.status.targetValue = this.status.userTargetValue;
            return this.calculateStatus(this.status.targetValue);
        }

        return 'ShouldNotReceiveThis'; //should never return this value;

        //reset to schedule: !isLocked and isUserCustom and scheduleChanged
        //is need it?!?!?
        // var restToSchedule = scheduleChanged && !this.status.isLocked && this.status.isUserCustom;


        // if (this.status.isUserCustom) {
        //     this.status.targetValue = this.status.userTargetValue;
        // }

        // this.status.currentSchedule;
        // this.oldStatus.currentSchedule;

        // //maybe can be removed
        // if (!this.calculateTarget(lastInfoNode, newInfoNode)) {
        //     this.error('Invalid state: target temperature and customer locking is active');
        //     return undefined;
        // }

        // var difference = (newInfoNode.targetValue - newInfoNode.currentTemp);
        // var newHeaterStatus = (difference < 0 ? "off" : "on");
        // var threshold = (newHeaterStatus === "off" ? this.config.threshold : this.config.threshold);
        // var changeStatus = (Math.abs(difference) >= threshold);
        // if (changeStatus) {
        //     newInfoNode.currentHeaterStatus = newHeaterStatus;
        // }
        // return newInfoNode;
    }
}

module.exports = Heater
