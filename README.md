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

## Properties

  * **Min** (integer)
    Minimum vale selectable using slider
  * **Max**  (boolean)
    Maximum vale selectable using slider
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
    "currentCalTarget":19,
    "currentHeaterStatus":"off",
    "userTargetValue":20,
    "isUserCustom":true
}    
```

  * **currentTemp** (float)
    The last current temperature received
  * **targetValue** (float)
    Target temperature displyed in front-end. Coul be user custom value, if is changed by the user, or calendar current temperature value set by calendar
  * **currentCalTarget** (float)
    Current calendar temperature. The value which would be set if the controller is set on calendar
  * **currentHeaterStatus** (string (on|off))
    Calculated the heater status based on the difference between target value and current temperature
  * **userTargetValue** (float)
    The last or current target temperature set by user    
  * **isUserCustom** (boolean)
    True if current target temperature is set by the user
## Changelog

### v1.0.0 (November 27, 2018)
* Stable release, fully functional.
### v0.0.1 (November 20, 2018)
* Initial commit;
