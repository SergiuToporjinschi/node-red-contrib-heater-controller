var UINode = require('./uINode')
const weekDays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
class Heater extends UINode {
    debugOffSet = 0;
    logs = [];
    constructor(RED, config) {
        super(RED, config)
        this.log('Heater Constructor')
        if (typeof (this.config) !== 'object' || !Object.hasOwnProperty.call(this.config, 'group') || typeof (this.config.group) !== 'string') {
            this.error('Missing configuration or group!!!');
            throw Error('Missing configuration or group');
        }
        this.config.calendar = JSON.parse(this.config.calendar);
        this.initCurrentState();
        this.initTopics();
    }


    initTopics() {
        this.addEvent('currentTemp', this.onTempChange); //this topic changes currentTemperature (WE MUST RECEIVE THIS MESSAGE)
        this.addEvent('userConfig', this.onUserConfig);//this topic can be used to change user settings, isLocked, userTargetValue
        this.addEvent('setCalendar', this.onSetCalendar); //this topic can be used to change current calendar
        this.addEvent('logs', this.onLogsRequest); //this topic can be used to change current calendar

        //FOR DEBUG ONLY
        /* istanbul ignore next */
        this.addEvent('debug', (function (msg) {
            this.warn('Debug topic should be used only for debug purpose!!!');
            if (msg.action === 'setStatus') {
                Object.assign(this.status, msg.payload);
            } else if (msg.action === 'offset') {
                this.debugOffSet = msg.payload.calChange;
            } else if (msg.action === 'reset') {
                this.status.currentSchedule.temp = 7;
                this.status.targetValue = 8;
                this.status.userTargetValue = 10;
                this.status.isUserCustom = false;
                this.status.isLocked = false;
                this.sendStatus();
            }
        }).bind(this)); //this topic can be used to change current calendar
    }

    initCurrentState() {
        this.status = {
            'currentTemp': undefined, //Current room temperature
            'targetValue': undefined, //Target temperature for the room
            'isUserCustom': undefined, //Is targetValue a user custom value?
            'isLocked': undefined, //Is targetValue locked (locker is true)
            'userTargetValue': undefined, //Target temperature set by user
            'currentSchedule': undefined, //Current target temperature from scheduler for this moment
            'nextSchedule': undefined, //Next target temperature from scheduler for next change
            'currentHeaterStatus': undefined, //Is heater running?
            'time': new Date().toLocaleString()
        }
        this.context().set('status', this.status);
        this.status.currentSchedule = this.getScheduleOffSet();
        this.status.nextSchedule = this.getScheduleOffSet(1);
        this.context().set('logs', this.logs);
    }

    onLogsRequest() {
        return { logs: this.logs };
    }

    onTempChange(msg) {
        //console.log('currentTemp');
        if (typeof (msg.payload) !== 'number') {
            this.error('onTempChange->Invalid payload [' + JSON.stringify(msg) + ']');
            throw new Error('Invalid payload');
        }

        this.status.currentTemp = msg.payload;

        //update schedulers
        this.status.currentSchedule = this.getScheduleOffSet(this.debugOffSet);
        this.status.nextSchedule = this.getScheduleOffSet(1 + this.debugOffSet);

        //recalculate status
        var calculatedStatus = this.recalculate();
        return { heaterStatus: calculatedStatus, status: this.status };
    }

    /**
     *
     * @param {object} msg
     * @todo Meeds refactoring of attribute check!!!
     */
    //TODO fix this
    // eslint-disable-next-line complexity
    onUserConfig(msg) {
        if (typeof (msg.payload) !== 'object' ||
            !(Object.hasOwnProperty.call(msg.payload, 'isLocked') || Object.hasOwnProperty.call(msg.payload, 'userTargetValue') || Object.hasOwnProperty.call(msg.payload, 'isUserCustom')) ||
            !(['undefined', 'boolean'].includes(typeof (msg.payload.isLocked)) &&
                ['undefined', 'number'].includes(typeof (msg.payload.userTargetValue)) &&
                ['undefined', 'boolean'].includes(typeof (msg.payload.isUserCustom)))) {
            this.error('onUserConfig->Invalid payload [' + JSON.stringify(msg) + ']');
            throw new Error('Invalid payload');
        }

        if (msg.payload.isUserCustom === true) {
            this.status.isUserCustom = true;
            this.status.userTargetValue = this.status.targetValue;
            msg.payload.userTargetValue = typeof (msg.payload.userTargetValue) !== 'undefined' ? msg.payload.userTargetValue : this.status.userTargetValue;
        } else if (msg.payload.isUserCustom === false) {
            delete msg.payload.isLocked; //if you send me isUserCustom = false I will decide if isLocked
            delete msg.payload.userTargetValue; //if you send me isUserCustom = false I will decide target temp
            this.status.isUserCustom = false;
            this.status.isLocked = false;
            this.status.targetValue = this.status.currentSchedule.temp;
        }

        if (msg.payload.isLocked === true) {
            this.status.isLocked = true;
            this.status.isUserCustom = true;
            //if I don't have a userTargetValue then take the current calendar value
            this.status.userTargetValue = typeof (this.status.targetValue) !== 'undefined' ? this.status.targetValue : this.status.currentSchedule.temp;
            this.status.targetValue = this.status.userTargetValue;
        } else if (msg.payload.isLocked === false) {
            this.status.isLocked = false;
            this.status.userTargetValue = this.status.targetValue;
        }

        if (msg.payload.userTargetValue) {
            this.status.userTargetValue = msg.payload.userTargetValue;
            this.status.targetValue = this.status.userTargetValue;
            this.status.isUserCustom = true;
        }
        this.status.userTargetValue = this.status.targetValue;
        //recalculate status
        var calculatedStatus = this.recalculate();
        return { heaterStatus: calculatedStatus, status: this.status };
    }

    onSetCalendar(msg) {
        if (typeof (msg.payload) !== 'object') {
            this.error('onSetCalendar->Invalid payload [' + JSON.stringify(msg) + ']');
            throw new Error('Invalid payload');
        }
        try {
            this.config.calendar = require('./calendarValidation').check(msg.payload);
        } catch (error) {
            this.error('Invalid calendar', error.details);
            throw error;
        }
        return { heaterStatus: undefined, status: this.status };
    }

    /**
     * Returns the code for a specific offset
     * @param {Number} offSet the number of days as offset, can be undefined == 0
     */
    getSearchedInterval(offSet) {
        var intervalList = [];
        for (var i in this.config.calendar) {
            var dayId = weekDays.indexOf(i);
            for (var j in this.config.calendar[i]) {
                intervalList.push(dayId + j.replace(':', ''));
            }
        }
        intervalList.sort();
        var nowCode = new Date().getDay() + ('0' + new Date().getHours()).slice(-2) + ('0' + new Date().getMinutes()).slice(-2);
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

        if (currentPoz < 0) currentPoz = intervalList.length - Math.abs(currentPoz); //if end of list then start from begging
        if (currentPoz > intervalList.length - 1) currentPoz = currentPoz - (intervalList.length);
        return intervalList[currentPoz];
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
        var intervalCode = this.getSearchedInterval(userOffset || 0);
        var weekDay = intervalCode[0];
        var time = intervalCode.substr(1).substr(0, 2) + ':' + intervalCode.substr(1).substr(2);

        var retObj = {
            time: time
        }
        retObj.day = weekDays[weekDay];
        retObj.temp = this.config.calendar[retObj.day][time];
        return retObj;
    }

    calculateStatus(targetValue) {
        if (this.status.currentTemp >= (this.config.threshold + targetValue)) {
            this.status.currentHeaterStatus = 'off';
        } else if (this.status.currentTemp <= (targetValue - this.config.threshold)) {
            this.status.currentHeaterStatus = 'on';
        }

        this._writeLog();
        //if currentTemp = 5, target = 5, threshold != 0 then there is a possibility for having no choice but keep the initial status
        //if there is no initial status then set it to OFF very very very low probability
        return this.status.currentHeaterStatus || this.oldStatus.currentHeaterStatus || 'off';
    }

    _writeLog() {
        if (this.config.logLength <= 0) return;
        var lastValue = this.logs.length > 0 ? this.logs[this.logs.length - 1] : {};
        if (lastValue.currentHeaterStatus === this.status.currentHeaterStatus) return;
        if (this.logs.length === this.config.logLength) {
            this.logs.shift();
        }
        this.logs.push(JSON.parse(JSON.stringify(this.status)));
    }

    //TODO fix this
    // eslint-disable-next-line complexity
    recalculate() {
        if (typeof (this.status) === 'undefined' || typeof (this.status.currentTemp) !== 'number') {
            this.debug('Recalculate: no current temperature!!!');
            return;
        }
        if (typeof (this.status.currentSchedule) !== 'object') {
            this.debug('Recalculate: no schedule!!!');
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

        //if no other chases are reached the it will be user custom value else scenario should not exits
        if (this.status.isUserCustom) {
            this.status.targetValue = this.status.userTargetValue;
            return this.calculateStatus(this.status.targetValue);
        }

        //simply temperature goes up and reaches the target
        this.calculateStatus(this.status.targetValue);

        //if nothing changed
        return this.status.currentHeaterStatus; //should return an unchanged status ;
    }
}

module.exports = Heater
