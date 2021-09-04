[![GitHub license](https://img.shields.io/github/license/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/node-red-contrib-heater-controller.svg?&service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller?activeTab=versions)
[![npm](https://img.shields.io/npm/dt/node-red-contrib-heater-controller.svg?service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![npm downloads](https://img.shields.io/npm/dm/node-red-contrib-heater-controller.svg?service=github)](https://www.npmjs.com/package/node-red-contrib-heater-controller)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller)
[![GitHub last commit](https://img.shields.io/github/last-commit/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/commits/master)
[![GitHub stars](https://img.shields.io/github/stars/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/SergiuToporjinschi/node-red-contrib-heater-controller.svg?service=github)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/watchers)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0a5d4e2aafae4234bbf4728d260c35d7)](https://app.codacy.com/gh/SergiuToporjinschi/node-red-contrib-heater-controller?utm_source=github.com&utm_medium=referral&utm_content=SergiuToporjinschi/node-red-contrib-heater-controller&utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/dc1e814f47a134beef43/maintainability?service=github)](https://codeclimate.com/github/SergiuToporjinschi/node-red-contrib-heater-controller/maintainability)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-heater-controller.svg?service=github)](http://packagequality.com/#?package=node-red-contrib-heater-controller)
[![Tests](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/workflows/Tests/badge.svg)](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/actions)
[![Coverage Status](https://coveralls.io/repos/github/SergiuToporjinschi/node-red-contrib-heater-controller/badge.svg?branch=Refactoring&service=github)](https://coveralls.io/github/SergiuToporjinschi/node-red-contrib-heater-controller?branch=Refactoring&service=github)
# node-red-contrib-heater-controller
A dashboard ui interface node for controlling a heater;

## Interface
![image](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/raw/master/images/front-end.png)
![image](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/raw/master/images/front-end-buttons.png)
 * 1 - target temperature value. The temperature desired by user;
 * 2 - current temperature
 * 3 - current status of the heater
 * 4 - slider for setting a custom value
 * 5 - current temperature from calendar
 * 6 - next temperature from calendar and the starting hour
 * 7 - warning that current temperature is missing so the controller is not active
 * 8 - if is locked, will keep the target temperature until user intervention; If is unlocked, will keep the target temperature until next calendar change;
 * 9 - reset to calendar

Once a custom value has been set will keep that value until the user is resetting it by double clicking the target value or by sliding it left or right, when the current calendar target value is taken from calendar.

Optimal size -> 8x5

## Properties
  * **Topic** (string)
    Topic used to trigger the heater
  * **Title** (string)
    Display an optional title in front-end
  * **Unit** (Celsius/Fahrenheit/Kelvin)
    Display unit
  * **Hysteresis**
    Sets the hysteresis threshold
  * **Logs>MaxLength**
    Maximum length of logs
  * **Min** (integer)
    Minimum value selectable using slider
  * **Max**  (boolean)
    Maximum value selectable using slider
  * **Step** (integer)
    Step value selectable from slider
  * **Calendar** (json)
    The calendar which will be apply in automatic mode. Needs to be a
    valid JSON with float values for temperature.
    Is important to cover the entire interval of 24/7, otherwise will
    keep the temperature until next since or next week day
    For example:

### Inputs messages
This controller has one main input and two outputs;
* First output is used to trigger the heater on or off;
* Second output is used to get some information about the node (current status, logs or configuration);

The input accepts the following topics:

### Topic: status
Triggers an status message on second output(Info) and no message on first output(Heater status)
Input example
```json
{
    "topic" : "status"
}
```
Output on `info` example
```json
{
  "topic":"status", //same input topic
  "payload":{
    "currentTemp": 10, //current room temperature (ref no.2)
    "targetValue": 20, //current target temperature (ref no.1)
    "isUserCustom": false, //is a current target user temperature considered (ref no.1 and 9)
    "isLocked": false,  //is locked to a custom target value (ref no.8)
    "userTargetValue": 20, //last user target temperature (ref no.1)
    "currentSchedule": { //current schedule from calendar (ref no.5)
      "time": "08:00",
      "day": "Saturday",
      "temp": 20
    },
    "nextSchedule": { //next schedule from calendar (ref no.6)
      "time": "20:00",
      "day": "Saturday",
      "temp": 22
    },
    "currentHeaterStatus": "on", //current heater status (ref no.3)
    "time":"9/4/2021, 1:47:27 PM"
  }
}
```

### Topic: logs
Triggers a message which contains the logs of the latest action. The array length is depending on the `Log: Max length` from node properties
Input example
```json
{
    "topic" : "logs"
}
```
Output on `info` example
```json
{
  "topic":"logs",  //same input topic
  "payload":[ //an array with the last actions
    {
      "currentTemp": 10,
      "targetValue": 20,
      "currentSchedule": {
        "time": "08:00",
        "day": "Saturday",
        "temp": 20
      },
      "nextSchedule": {
        "time": "20:00",
        "day": "Saturday",
        "temp": 22
      },
      "currentHeaterStatus": "on", //heater status when the action was triggered (ref no.3)
      "time":"9/4/2021, 1:47:27 PM" //execution time
    }
  ]
}
```

### Topic: config
Triggers a message which contains the current node properties
Input example
```json
{
    "topic" : "config"
}
```
Output on `info` example
```json
{
  "topic":"config",
  "payload":{
    "title":"Heater",
    "topic":"newHeaterStatus",
    "logLength":1,
    "threshold":0.5,
    "calendar":{
      "Monday":{"00:00":19,"06:20":22,"08:00":19,"16:40":22,"23:59":19},
      "Tuesday":{"00:00":19,"06:20":22,"08:00":19,"16:40":22,"23:59":19},
      "Wednesday":{"00:00":19,"06:20":22,"08:00":19,"16:40":22,"23:59":19},
      "Thursday":{"00:00":19,"06:20":22,"08:00":19,"16:40":22,"23:59":19},
      "Friday":{"00:00":19,"06:20":23,"08:00":19,"16:40":22,"23:59":19},
      "Saturday":{"00:00":19,"08:00":20,"20:00":22,"23:59":19},
      "Sunday":{"00:00":19,"08:00":20,"20:00":22,"23:59":19}
    },
    "unit":"C",
    "displayMode":"buttons",
    "sliderMaxValue":35,
    "sliderMinValue":10,
    "sliderStep":0.5
  }
}
```

#### Topic: currentTemp
A message with this topic should come from time to time, containing a payload with an integer or float number (integer or float number); The payload value should represent the current room/boiler temperature;
Each time `currentTemp` message is received the entire logic is executed to decide if is the case to trigger an out put with on or off status for starting the heater.

**<span style="color:red">NOTE:</span> <span style="color:red">If this message is not received then no logic is executed and the entire control will remain in current state.**</span>

```json
{
    "topic" : "currentTemp",
    "payload" : 22.5
}
```

#### Topic: userConfig
Can be used to control the node with an input message. Basically almost all actions that user can do from dashboard should be possible with this message.
Payload should be an json structure with the following options

* **isLocked (boolean [ true | false ]; interface reference no. 8)**
  If is true will lock the heater to current state until next user intervention (via interface or another message with value false)

```json
{
    "topic" : "userConfig",
    "payload" : {"isLocked": true}
}

```
* **userTargetValue (number [ integer | float ]; interface reference no. 4)**
  Allows you to set the target value. If the `currentTemp` value is below `userTargetValue`, a trigger to start the heater will be emitted; if the currentTemp is bigger than userTargetValue the

```json
{
    "topic" : "userConfig",
    "payload" : {"userTargetValue": 20.0}
}
```

* **isUserCustom (boolean [ true | false ]; interface reference no. 8)**
  Allows you to set the target value. If the `isUserCustom` is true then the current target value is preserved until next calendar or user intervention.

```json
{
    "topic" : "userConfig",
    "payload" : {"isUserCustom": true}
}
```

## HeaterStatus output

A message is emitted when the status is recalculated (when the user is changing the target temperature, from interface or with a `userConfig` message, or a new `currentTemp` is received)

Example:
```json
{
    "topic" : "newHeaterStatus", //topic set in node properties
    "payload" : "on"
}
```
## Context tab
In context tab for this node two variables are displayed
* `logs` containing the current stored logs
* `status` current node status

## [ChangeLog](CHANGELOG.md)

## [Testing schema](TestingFlows.md)


If you find this project useful, please consider supporting it with a donation <br/>
[![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://paypal.me/GitHubPrj?locale.x=en_US)

