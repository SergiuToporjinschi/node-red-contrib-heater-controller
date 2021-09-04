### v3.0.0 (September 4, 2021)
*  Structural changes;
*  Migration to ECMA6
*  isUserCustomLocked becomes isLocked;
*  One single message for all `userConfig`
*  Supports buttons interface;
*  Different output points for controlling the heater and getting node info
*  Exception can be caught with catch node
### v2.0.1 (January 29, 2020)
*  Adding optional title [Suggestion: UI element to identify heater / add heater name #35](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/35);
### v2.0.0 (January 19, 2020)
*  Support for Node-red 1.0;
*  Adding `isLocked` and `userConfig` as incoming message;
*  Fixing issue [0.1 increment in Hysteresis #33](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/33);
*  Fixing issue [take isLocked from input msg #28](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/28);
### v1.2.2 (March 28, 2019)
*  Fixing (ticket [not working with latest node-red version 0.20.3 #20](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/20))
### v1.2.1 (March 13, 2019)
*  Allowing negative values in hysteresis (ticket [Allow a minus figure in the upper hysteresis entry #18](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/18))
*  Update documentation (ticket [Padlock function ? #17](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/17))
*  Changeable Calendar by message (ticket [Changeable Calendar by message #16](https://github.com/SergiuToporjinschi/node-red-contrib-heater-controller/issues/16))
### v1.2.0 (December 28, 2018)
*  Add German translation (thanks to [HanSolo72](https://github.com/HanSolo72))
*  Chang user value using "userTargetValue" topic (thanks to [Alcantor](https://github.com/Alcantor))
### v1.1.9 (December 12, 2018)
*  Adding topic
### v1.1.6 (December 12, 2018)
*  Configurable measurement unit
### v1.1.4 (December 09, 2018)
*  Changing icon
### v1.1.1 (December 09, 2018)
*  Bug fixing,
*  Fixing validation of config parameters;
*  Changing the controller name to be complaint to the rule according which all UI controls needs to be prefixed with "ui_"
### v1.1.0 (December 03, 2018)
*  Bug fixing,
*  Adding locked user custom value; which is preventing schedule to change target temperature until user manual unlocks
### v1.0.1 (November 27, 2018)
*  Bug fixing
### v1.0.0 (November 27, 2018)
*  Stable release, fully functional.
### v0.0.1 (November 20, 2018)
*  Initial commit;