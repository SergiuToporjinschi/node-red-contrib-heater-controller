[![GitHub license](https://img.shields.io/github/license/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/node-red-contrib-heater-controller.svg?&service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller?activeTab=versions)
[![npm](https://img.shields.io/npm/dt/node-red-contrib-heater-controller.svg?service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![npm downloads](https://img.shields.io/npm/dm/node-red-contrib-heater-controller.svg?service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller)
[![GitHub last commit](https://img.shields.io/github/last-commit/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/commits/master)
[![GitHub stars](https://img.shields.io/github/stars/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/watchers)

[![Maintainability](https://api.codeclimate.com/v1/badges/dc1e814f47a134beef43/maintainability?service=github)](https://codeclimate.com/github/SergiuToporjinschi/node-red-contrib-heater-controller/maintainability)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-heater-controller.svg?service=github)](http://packagequality.com/#?package=node-red-contrib-heater-controller)
[![Tests](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/workflows/Tests/badge.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/actions)
[![Coverage Status](https://coveralls.io/repos/github/SergiuToporjinschi/node-red-contrib-heater-controller/badge.svg?branch=Refactoring&service=github)](https://coveralls.io/github/SergiuToporjinschi/node-red-contrib-heater-controller?branch=Refactoring&service=github)
# node-red-contrib-heater-controller
A dashboard ui interface node for controlling a heater;

## Interface
![image](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/raw/master/images/front-end.png)
 * 1 - target temperature value. The temperature desired by user;
 * 2 - current temperature
 * 3 - current status of the heater
 * 4 - slider for setting a custom value
 * 5 - current temperature from calendar
 * 6 - next temperature from calendar and the starting hour
 * 7 - warning that current temperature is missing so the controller is not active
 * 8 - if is locked, will keep the target temperature until user intervention; If is unlocked, will keep the target temperature until next calendar change;

Once a custom value has been set will keep that value until the user is resetting it by double clicking the target value or by sliding it left or right, when the current calendar target value is taken from calendar.

## Properties
  * **Title** (string)
    Display an optional title in front-end
  * **Unit** (Celsius/Fahrenheit/Kelvin)
    Display unit
  * **Min** (integer)
    Minimum value selectable using slider
  * **Max**  (boolean)
    Maximum value selectable using slider
  * **Step** (integer)
    Step value selectable from slider
  * **Upper** threshold (float)
    Hysteresis upper threshold limit. This value is added to the target
    temperature to determinate the point of setting the heater to off
  * **Lower** threshold (float)
    Hysteresis Lower threshold limit. This value is added to the target
    temperature to determinate the point of setting the heater to on
  * **Calendar** (json)
    The calendar which will be apply in automatic mode. Needs to be a
    valid JSON with float values for temperature.
    Is important to cover the entire interval of 24/7, otherwise will
    keep the temperature until next since or next week day
    For example:

### Inputs

This controller accepts one main input which has to have topic as
"currentTemp" and payload needs to be a float
The entire control is not functional until this message is received
The heater status is recalculated when this message received, or when the
user is changing the target temperature.

Message example:
```json
{
    "topic" : "currentTemp",
    "payload" : "22.5"
}
```
* **userConfig** - To set user configuration value other than through the UI (eg. Voice command), the optional topic "userConfig" can be used.
  * `isLocked` - will enable/disable the lock on the dashboard;
  * `userTargetValue` - will set a user target temperature on the dashboard, and will set `isUserCustom` as true if is not set in the message;
  * `isUserCustom` - will set a user target temperature on the dashboard according to current target or to current `userTargetValue`, if is received on false without `userTargetValue` then the will change only the slider;
```json
{
    "topic" : "userConfig",
    "payload" : {"isLocked": true, "userTargetValue": 25.5, "isUserCustom": false}
}
```
* **userTargetValue** - To set the temperature target value other than through the UI (eg. Voice command), the optional topic "userTargetValue" can be used.
**<span style="color:orange">DEPRECATED</span>**<span style="color:orange">: This feature will be remove on next release, use `userConfig` instead</span>
```json
{
    "topic" : "userTargetValue",
    "payload" : "20.0"
}
```

* **isLocked** - To set userCustomLocked value other than through the UI (eg. Voice command), the optional topic `isLocked` can be used.
**<span style="color:orange">DEPRECATED</span>**<span style="color:orange">: This feature will be remove on next release, use userConfig instead</span>
```json
{
    "topic" : "isLocked",
    "payload" : true
}
```
* **setCalendar** - To set the calendar by input message.
**<span style="color:red">NOTE</span>**<span style="color:red">: payload needs to be JSON Type</span>

```json
{
    "topic" : "setCalendar",
    "payload" : {
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
            "16:40": 22,
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
    }
}
```
## Output

A message is emitted when the status is recalculated (when the user is
changing the target temperature or a new input message is received)

For example:
```
{
    "currentTemp":25,
    "targetValue":20,
    "currentSchedule":{
        temp: 19,
        day: "Wednesday",
        time: "00:00"
    },
    "nextSchedule":{
        temp: 22,
        day: "Wednesday",
        time: "06:20"
    },
    "currentHeaterStatus":"off",
    "userTargetValue":20,
    "isUserCustom":true
}
```

  * **currentTemp** (float)
    The last current temperature received
  * **targetValue** (float)
    Target temperature displayed in front-end. Could be user custom value, if is changed by the user, or calendar current temperature value set by calendar
  * **currentSchedule** (float)
    Current calendar schedule. The value which would be set if the controller is set on calendar and some additional information like day of the week and time
  * **nextSchedule** (float)
    Next calendar schedule. The value which will be set if the controller is set on calendar and some additional information when this will like happen like day of the week and time
  * **currentHeaterStatus** (string (on|off))
    Calculated the heater status based on the difference between target value and current temperature
  * **userTargetValue** (float)
    The last or current target temperature set by user
  * **isUserCustom** (boolean)
    True if current target temperature is set by the user
## [ChangeLog](CHANGELOG.md)

## Testing schema
```
[{"id":"9f075ea8.007b5","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"8d843aee.e64708","type":"inject","z":"9f075ea8.007b5","name":"setCalendar","topic":"setCalendar","payload":"{\"Monday\":{\"00:00\":29,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Tuesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Wednesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":10,\"23:59\":10},\"Thursday\":{\"00:00\":10,\"06:20\":10,\"08:00\":10,\"16:40\":10,\"23:59\":10},\"Friday\":{\"00:00\":19,\"06:20\":23,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Saturday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19},\"Sunday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19}}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":290,"y":280,"wires":[["be16a6b4.a604a8"]]},{"id":"b000512d.5fdf3","type":"inject","z":"9f075ea8.007b5","name":"","topic":"currentTemp","payload":"23","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":300,"y":240,"wires":[["be16a6b4.a604a8"]]},{"id":"abf89762.4ac078","type":"debug","z":"9f075ea8.007b5","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":710,"y":320,"wires":[]},{"id":"49388ca6.3755e4","type":"inject","z":"9f075ea8.007b5","name":"","topic":"userTargetValue","payload":"29","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":310,"y":320,"wires":[["be16a6b4.a604a8"]]},{"id":"ed8931c.ddf2bd","type":"inject","z":"9f075ea8.007b5","name":"isLocked","topic":"isLocked","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":320,"y":360,"wires":[["be16a6b4.a604a8"]]},{"id":"be16a6b4.a604a8","type":"ui_heater_controller","z":"9f075ea8.007b5","name":"heater","group":"add64240.8d8c9","unit":"C","order":0,"width":8,"height":3,"topic":"","sliderMinValue":10,"sliderMaxValue":35,"sliderStep":0.5,"thresholdRising":0.5,"thresholdFalling":0.5,"calendar":"{\n    \"Monday\": {\n        \"00:00\": 15,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Tuesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Wednesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Thursday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Friday\": {\n        \"00:00\": 19,\n        \"06:20\": 23,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Saturday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    },\n    \"Sunday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    }\n}","x":540,"y":320,"wires":[["abf89762.4ac078"]]},{"id":"17a1e35f.e3edbd","type":"inject","z":"9f075ea8.007b5","name":"userConfig","topic":"userConfig","payload":"{\"isLocked\":true,\"userTargetValue\":25.5}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":280,"y":400,"wires":[["be16a6b4.a604a8"]]},{"id":"f68b7cae.409f9","type":"inject","z":"9f075ea8.007b5","name":"isUserCustom","topic":"userConfig","payload":"{\"isLocked\":true,\"isUserCustom\": false, \"userTargetValue\": 23.5}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":290,"y":440,"wires":[["be16a6b4.a604a8"]]},{"id":"add64240.8d8c9","type":"ui_group","z":"","name":"Devices","tab":"b94da3c8.213ed","order":1,"disp":true,"width":"8","collapse":false},{"id":"b94da3c8.213ed","type":"ui_tab","z":"","name":"Tab 1","icon":"dashboard","order":1,"disabled":false,"hidden":false}]
```
