module.exports = function (RED) {
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("heater-controller.error.no-group"));
            return false;
        }
        return true;
    }

    // TODO maybe I should replace this method or remove it
    function storeInContext(node, value) {
        var context = node.context();
        var values = context.get("values") || {};
        for (var i in value) {
            values[i] = value[i];
        }
        context.set("values", values);
        return values;
    }
    function storeKeyInContext(node, key, value) {
        var context = node.context();
        var values = context.get("values") || {};
        if (key && value) {
            values[key] = value;
        }
        context.set("values", values);
        return values;
    }

    /**
     * Decides if we should turn on or off the heater;
     * @param {currentSettings} status current information about stauts of controller
     * @param {trashhold} threshold Trashsold to be able to calculate the new status of heater
     */
    function recalculateAndTrigger(status, thresholdRising, thresholdFalling) {
        // console.log('triggered with: ', status, thresholdRising, thresholdFalling);
        var difference = (status.targetValue - status.currentTemp);
        var newHeaterStatus = (difference < 0 ? "off" : "on");
        var threshold = (newHeaterStatus === "off" ? thresholdRising : thresholdFalling);
        var changeStatus = (Math.abs(difference) >= threshold);
        if (changeStatus != status.currentHeaterStatus) {
            status.currentHeaterStatus = newHeaterStatus;
        }
        return status;
    };
    function getScheduleTemp(calendar) {
        var timeNow = ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2);
        var weekDays = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var calDay = calendar[weekDays[new Date().getDay()]];
        if (calDay[timeNow]) { //maybe I'm lucky
            return calDay[timeNow];
        } else {
            var times = Object.keys(calDay);
            times.push(timeNow);
            times.sort();
            return calDay[times[times.indexOf(timeNow) - 1]];
        }
    }; 
    function HTML(config) {
        var css = String.raw`<style>
        .iconFalse {
            color: gray;
        }
        .iconTrue {
            color: #ff4d4d;
        }
        .icon {
            margin: 0;
            margin-left: 10px;
            font-size:1em;
        }
        .userSettingsIcon {
            margin-right: 20px;
        }
        .targetTemp {
            color: #0094ce;
            font-size: 1em;
            font-weight: bold;
        }
        .heaterContr {
            margin-left: 10px;
        }
        .slider {
            margin-left: 10px;
            margin-right: 10px;
        }
        .temp {
            color: #0094ce;
            font-size: 4em;
            font-weight: bold;
        }
        .warning-icon i {
            margin-left: 5px;
            margin-right: 5px;
        }
        .no-select:focus {
            outline: none;
            cursor: pointer;
            -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
            -khtml-user-select: none; /* Konqueror HTML */
            -moz-user-select: none; /* Firefox */
            -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
        }
        .user-mode {
            color: rgb(63,81,181);
        }
        </style>`
        var conf = JSON.stringify(config);
        var html = String.raw`
        <div layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>
            <div layout="row" layout-align="end center" class="warning-icon" ng-if="!msg.currentTemp" style="color:red">
                <i class="fa fa-calendar" aria-hidden="true" ng-if="!config.calendar"></i>
                <i class="fa fa-thermometer-empty" aria-hidden="true" ng-if="!msg.currentTemp"></i>
            </div>
            <div layout="row" layout-align="center center" class="container">
                <div layout-align="end center" layout="column">
                    <div ng-class="{'user-mode': msg.isUserCustom}" class="temp no-select" md-swipe-left="toSchedule()" md-swipe-right="toSchedule()" ng-dblclick="toSchedule()">{{msg.targetValue | number:1}}&deg;C</div>
                </div>
                <div class='heaterContr' layout-align="center center" layout="column">
                    <div class="targetTemp" flex="50">{{msg.currentTemp | number:1}}</div>
                    <div layout-align="space-between" layout="row" flex="50">
                        <i class="fa fa-fire icon" ng-class="msg.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
            <div layout-align="center stretch" layout="column">
                <md-slider ng-change="sendVal()" class="md-primary slider" md-discrete ng-model="msg.userTargetValue" step="${config.sliderStep}" min="${config.sliderMinValue}" max="${config.sliderMaxValue}">
            </div>
        </div>`
        return css + html;
    };

    var ui = undefined;
    var allowedTopics = ['currentTemp', 'currentHeaterStatus'];
    function ListNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var done = null;
            if (checkConfig(node, config)) {
                node.config = config;
                config.calendar = JSON.parse(node.config.calendar);
                var html = HTML(config);
                done = ui.addWidget({
                    node: node,
                    width: config.width,
                    height: config.height,
                    format: html,
                    templateScope: "local",
                    group: config.group,
                    emitOnlyNewValues: false,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: true,
                    beforeEmit: function (msg, value) {
                        // console.log('beforeEmit');
                        if (msg.topic === 'calendar') { //TODO de testat, trebuie decis daca ramane sau o scot
                            node.config.calendar = value;
                            return { msg: storeKeyInContext(node) }; //return what I already have
                        } else if (allowedTopics.indexOf(msg.topic) < 0) { //if topic is not a safe one just trigger a refresh of UI
                            return { msg: storeKeyInContext(node) }; //return what I already have
                        }

                        var returnValues = storeKeyInContext(node, msg.topic, value);
                        if ('currentTemp' === msg.topic) {
                            returnValues.targetValue = getScheduleTemp(node.config.calendar);
                            returnValues = recalculateAndTrigger(returnValues, node.config.thresholdRising, node.config.thresholdFalling);
                            node.send({ payload: returnValues });
                        }
                        return { msg: returnValues };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return { payload: storeInContext(node, recalculateAndTrigger(orig.msg, node.config.thresholdRising, node.config.thresholdFalling)) };
                        }
                    },
                    initController: function ($scope, events) {
                        $scope.init = function (conf) {
                            // console.log('init');
                            $scope.config = conf;
                        };
                        
                        function getScheduleTemp(calendar) {
                            var timeNow = moment().format("HH:mm");
                            var weekDays = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                            var calDay = calendar[weekDays[moment().weekday()]];
                            if (calDay[timeNow]) { //maybe I'm lucky
                                return calDay[timeNow];
                            } else {
                                var times = Object.keys(calDay);
                                times.push(timeNow);
                                times.sort();
                                return calDay[times[times.indexOf(timeNow) - 1]];
                            }
                        };
                        $scope.toSchedule = function () {
                            $scope.msg.isUserCustom = false;
                            $scope.msg.targetValue = getScheduleTemp($scope.config.calendar);
                            $scope.send($scope.msg);
                        };
                        $scope.sendVal = function () {
                            $scope.msg.targetValue = $scope.msg.userTargetValue;
                            $scope.msg.isUserCustom = true;
                            $scope.send($scope.msg);
                        };
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
        node.on("close", function () {
            console.log('done');
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('heater-controller', ListNode);
};