[![npm version](https://img.shields.io/npm/v/node-red-contrib-heater-controller.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-heater-controller?activeTab=versions)
[![npm](https://img.shields.io/npm/dt/node-red-contrib-heater-controller.svg)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![npm downloads](https://img.shields.io/npm/dm/node-red-contrib-heater-controller.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller)
[![GitHub last commit](https://img.shields.io/github/last-commit/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/commits/master)
[![GitHub stars](https://img.shields.io/github/stars/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/watchers)
[![GitHub license](https://img.shields.io/github/license/SergiuToporjinschi/node-red-contrib-heater-controller.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/blob/master/LICENSE)

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

Once a custom value has been set will keep that value untill the user is resetting it by double clicking the tarvet value or by sliding it left or right, when the current calendar target value is taken from calendar.

## Properties

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
The entire control is not functional untill this message is received
The heater status is recalculated when this message recived, or when the
user is changing the target temperature.

Message example:
``` 
{
    "topic" : "currentTemp",
    "payload" : "22.5"
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

### v1.1.1 (December 03, 2018)
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
[{"id":"53277f3f.d132e","type":"inject","z":"d6abf2dd.559db","name":"","topic":"currentTemp","payload":"23.5","payloadType":"num","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":320,"y":160,"wires":[["a888b00b.0117f"]]},{"id":"a888b00b.0117f","type":"ui_heater_controller","z":"d6abf2dd.559db","name":"","group":"b65552e.2f213b","order":0,"width":8,"height":3,"sliderMinValue":10,"sliderMaxValue":35,"sliderStep":0.5,"thresholdRising":0.5,"thresholdFalling":0.5,"calendar":"{\n    \"Monday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Tuesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Wednesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Thursday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Friday\": {\n        \"00:00\": 19,\n        \"06:20\": 23,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Saturday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    },\n    \"Sunday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    }\n}","x":540,"y":160,"wires":[[]]},{"id":"b65552e.2f213b","type":"ui_group","z":"","name":"Group 1","tab":"1913485f.ed4198","order":1,"disp":true,"width":"8","collapse":false},{"id":"1913485f.ed4198","type":"ui_tab","name":"Tab 1","icon":"dashboard","order":1}]
```
