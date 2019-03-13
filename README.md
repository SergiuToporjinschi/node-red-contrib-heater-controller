[![npm version](https://img.shields.io/npm/v/node-red-contrib-heater-controller.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-heater-controller?activeTab=versions)
[![npm](https://img.shields.io/npm/dt/node-red-contrib-heater-controller.svg)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![npm downloads](https://img.shields.io/npm/dm/node-red-contrib-heater-controller.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller)
[![GitHub last commit](https://img.shields.io/github/last-commit/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/commits/master)
[![GitHub stars](https://img.shields.io/github/stars/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/watchers)
[![GitHub license](https://img.shields.io/github/license/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/blob/master/LICENSE)
[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/SergiuToporjinschi/node-red-contrib-heater-controller)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-heater-controller.svg)](http://packagequality.com/#?package=node-red-contrib-heater-controller)

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

Once a custom value has been set will keep that value untill the user is resetting it by double clicking the tarvet value or by sliding it left or right, when the current calendar target value is taken from calendar.

## Properties
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
    keep the temperature untill next sice or next week day
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

To set the temperature target value other than through the UI (eg. Voice command), the optional topic "userTargetValue" can be used.

```json
{
    "topic" : "userTargetValue",
    "payload" : "20.0"
}
```

To set the calendar by imput message. 
**<span style="color:red">ATTENTION</span>**<span style="color:red">: payload needs to be JSON Type</span>

```json
{
    "topic" : "setCalendar",
    "payload" : {
        "Monday": {
            "00:00": 99,
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

A message is emited when the status is recalculated (when the user is
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
    Target temperature displyed in front-end. Coul be user custom value, if is changed by the user, or calendar current temperature value set by calendar
  * **currentSchedule** (float)
    Current calendar schedule. The value which would be set if the controller is set on calendar and some aditional information like day of the week and time
  * **nextSchedule** (float)
    Next calendar schedule. The value which will be set if the controller is set on calendar and some aditional information when this will like happen like day of the week and time
  * **currentHeaterStatus** (string (on|off))
    Calculated the heater status based on the difference between target value and current temperature
  * **userTargetValue** (float)
    The last or current target temperature set by user    
  * **isUserCustom** (boolean)
    True if current target temperature is set by the user
## Changelog

### v1.2.1 (March 13, 2019)
* Allowing negative values in hysteresis (ticket [Allow a minus figure in the upper hysteresis entry #18](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/18))
* Update documentation (ticket [Padlock function ? #17](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/17))
* Changeable Calendar by message (ticket [Changeable Calendar by message #16](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/16))
### v1.2.0 (December 28, 2018)
* Add German translation (thanks to [HanSolo72](https://github.com/HanSolo72))
* Chang user value using "userTargetValue" topic (thanks to [Alcantor](https://github.com/Alcantor))
### v1.1.9 (December 12, 2018)
* Adding topic
### v1.1.6 (December 12, 2018)
* Configurable measurement unit
### v1.1.4 (December 09, 2018)
* Changing icon
### v1.1.1 (December 09, 2018)
* Bug fixing,
* Fixing validation of config parameters;
* Changing the controller name to be complaint to the rule according which all UI controls needs to be prefixed with "ui_"
### v1.1.0 (December 03, 2018)
* Bug fixing,
* Adding locked user custom value; which is preventing schedule to change target temperature until user manual unlocks
### v1.0.1 (November 27, 2018)
* Bug fixing
### v1.0.0 (November 27, 2018)
* Stable release, fully functional.
### v0.0.1 (November 20, 2018)
* Initial commit;

## Testing schema
```
[{"id":"1bd80269.b8fb3e","type":"inject","z":"8a6eba9e.37afb8","name":"setCalendar","topic":"setCalendar","payload":"{\"Monday\":{\"00:00\":29,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Tuesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Wednesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":10,\"23:59\":10},\"Thursday\":{\"00:00\":10,\"06:20\":10,\"08:00\":10,\"16:40\":10,\"23:59\":10},\"Friday\":{\"00:00\":19,\"06:20\":23,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Saturday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19},\"Sunday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19}}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":190,"y":260,"wires":[["a47a34f8.a58ec8"]]},{"id":"a47a34f8.a58ec8","type":"ui_heater_controller","z":"8a6eba9e.37afb8","name":"heater","group":"e7110dea.42a4f","unit":"C","order":0,"width":8,"height":3,"topic":"","sliderMinValue":11,"sliderMaxValue":30,"sliderStep":0.5,"thresholdRising":0.5,"thresholdFalling":0.5,"calendar":"{\n    \"Monday\": {\n        \"00:00\": 99,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Tuesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Wednesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Thursday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Friday\": {\n        \"00:00\": 19,\n        \"06:20\": 23,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Saturday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    },\n    \"Sunday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    }\n}","x":390,"y":260,"wires":[["9c97d5a.ffc3d28"]]},{"id":"d4e58ace.1c50b8","type":"inject","z":"8a6eba9e.37afb8","name":"","topic":"currentTemp","payload":"23","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":200,"y":220,"wires":[["a47a34f8.a58ec8"]]},{"id":"9c97d5a.ffc3d28","type":"debug","z":"8a6eba9e.37afb8","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":530,"y":260,"wires":[]},{"id":"29a31b65.adcd74","type":"inject","z":"8a6eba9e.37afb8","name":"","topic":"userTargetValue","payload":"27","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":210,"y":300,"wires":[["a47a34f8.a58ec8"]]},{"id":"e7110dea.42a4f","type":"ui_group","z":"","name":"Default","tab":"3d03ca82.b2eac6","disp":true,"width":"8","collapse":false},{"id":"3d03ca82.b2eac6","type":"ui_tab","z":"","name":"Home","icon":"dashboard","disabled":false,"hidden":false}]
```
