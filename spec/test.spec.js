var should = require("should");
// var helper = require("node-red-node-test-helper");

// var heater = require("../heater-controller.js");
// helper.init(require.resolve('node-red'), {
//     functionGlobalContext: { os: require('os') },
//     userDir: 'C:/Users/toporjinschi/.node-red/'
// });

describe("A suite", function () {

    var flow = [
        {
            "id": "452673c7.42763c",
            "type": "ui_heater_controller",
            "z": "4f392283.8d7aec",
            "name": "heater",
            "group": "217a38ac.824388",
            "unit": "C",
            "displayMode": "buttons",
            "order": 1,
            "width": "6",
            "height": "4",
            "topic": "",
            "title": "Titlu",
            "logLengthType": "days",
            "logLength": 1,
            "sliderMinValue": 10,
            "sliderMaxValue": 35,
            "sliderStep": 0.5,
            "thresholdRising": 0.5,
            "thresholdFalling": 0.5,
            "calendar": "{\n    \"Monday\": {\n        \"00:00\": 15,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Tuesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Wednesday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Thursday\": {\n        \"00:00\": 19,\n        \"06:20\": 22,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Friday\": {\n        \"00:00\": 19,\n        \"06:20\": 23,\n        \"08:00\": 19,\n        \"16:40\": 22,\n        \"23:59\": 19\n    },\n    \"Saturday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    },\n    \"Sunday\": {\n        \"00:00\": 19,\n        \"08:00\": 20,\n        \"20:00\": 22,\n        \"23:59\": 19\n    }\n}",
            "x": 550,
            "y": 320,
            "wires": [
                [
                    "24eaa461.e1299c"
                ],
                [
                    "f289d82d.8330f8"
                ]
            ]
        },
        {
            "id": "84e7c0c1.2f5fc",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "setCalendar",
            "topic": "setCalendar",
            "payload": "{\"Monday\":{\"00:00\":29,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Tuesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Wednesday\":{\"00:00\":19,\"06:20\":22,\"08:00\":19,\"16:40\":10,\"23:59\":10},\"Thursday\":{\"00:00\":10,\"06:20\":10,\"08:00\":10,\"16:40\":10,\"23:59\":10},\"Friday\":{\"00:00\":19,\"06:20\":23,\"08:00\":19,\"16:40\":22,\"23:59\":19},\"Saturday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19},\"Sunday\":{\"00:00\":19,\"08:00\":20,\"20:00\":22,\"23:59\":19}}",
            "payloadType": "json",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 290,
            "y": 280,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "908e6492.1bdba8",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "",
            "topic": "currentTemp",
            "payload": "23",
            "payloadType": "num",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 300,
            "y": 240,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "79d9439c.01d95c",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "",
            "topic": "userTargetValue",
            "payload": "29",
            "payloadType": "num",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 310,
            "y": 320,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "dfbcad05.3f0c4",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "isUserCustomLocked",
            "topic": "isUserCustomLocked",
            "payload": "true",
            "payloadType": "bool",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 320,
            "y": 360,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "24eaa461.e1299c",
            "type": "debug",
            "z": "4f392283.8d7aec",
            "name": "",
            "active": true,
            "tosidebar": true,
            "console": false,
            "tostatus": false,
            "complete": "true",
            "targetType": "full",
            "x": 850,
            "y": 260,
            "wires": []
        },
        {
            "id": "f289d82d.8330f8",
            "type": "debug",
            "z": "4f392283.8d7aec",
            "name": "",
            "active": true,
            "tosidebar": true,
            "console": false,
            "tostatus": false,
            "complete": "true",
            "targetType": "full",
            "x": 730,
            "y": 420,
            "wires": []
        },
        {
            "id": "888fd024.a1f7a",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "userConfig",
            "topic": "userConfig",
            "payload": "{\"isUserCustomLocked\":true,\"userTargetValue\":25.5}",
            "payloadType": "json",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 280,
            "y": 400,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "3b61b7ee.558438",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "isUserCustom",
            "topic": "userConfig",
            "payload": "{\"isUserCustomLocked\":true,\"isUserCustom\": false, \"userTargetValue\": 23.5}",
            "payloadType": "json",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 290,
            "y": 440,
            "wires": [
                [
                    "452673c7.42763c"
                ]
            ]
        },
        {
            "id": "d4b35e7d.a027b",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "",
            "topic": "currentTemp",
            "payload": "22",
            "payloadType": "num",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 300,
            "y": 160,
            "wires": [
                [
                    "452673c7.42763c",
                    "5a22fd43.741a14",
                    "aa827ee4.b56be"
                ]
            ]
        },
        {
            "id": "71e5a498.dbdcbc",
            "type": "inject",
            "z": "4f392283.8d7aec",
            "name": "",
            "topic": "currentTemp",
            "payload": "24",
            "payloadType": "num",
            "repeat": "",
            "crontab": "",
            "once": false,
            "onceDelay": 0.1,
            "x": 300,
            "y": 200,
            "wires": [
                [
                    "aa827ee4.b56be"
                ]
            ]
        },
        {
            "id": "217a38ac.824388",
            "type": "ui_group",
            "z": "",
            "name": "Devices",
            "tab": "defb06ba.c2e8f8",
            "order": 2,
            "disp": true,
            "width": "6",
            "collapse": false
        },
        {
            "id": "defb06ba.c2e8f8",
            "type": "ui_tab",
            "z": "",
            "name": "Tab 1",
            "icon": "dashboard",
            "order": 1,
            "disabled": false,
            "hidden": false
        }
    ];
    // afterEach(function (done) {
    //     helper.unload().then(function () {
    //         helper.stopServer(done);
    //     });
    // });

    // before(function (done) {
    //     helper.settings({
    //         functionGlobalContext: { os: require('os') },
    //         userDir: 'C:/Users/toporjinschi/.node-red/'
    //     });
    //     helper.startServer(done);
    // });

    var flow1 = [
        {
            "id": "testNode",
            "type": "ui_heater_controller",
            "name": "theName"
        }
    ];
    // const fs = require('fs');

    // let rawdata = fs.readFileSync('C:/Users/toporjinschi/.node-red/flows_RO-WKS060W10.json');
    // let student = JSON.parse(rawdata);
    // "C:\Users\toporjinschi\.node-red\flows_RO-WKS060W10.json"
    it("Loading node", function (done) {
        var bn = require('backEndNode.js')({}, {});
        bn.getAdaptedConfig();
        // helper.load(heater, flow, function () {
        //     var n1 = helper.getNode("452673c7.42763c");
        //     n1.should.have.property('name', 'heater');
        //     done();
        // });
    });
});