'use strict';
module.exports.init = function (config) { // { getHTML = function () {
    var conf = JSON.stringify(config);
    function getCSS() {
        return String.raw`<style>
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
            </style>`;
    }
    function getHTML() {
        return String.raw`
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
        </div>`;
    }

    function getController($scope, events) {
        $scope.init = function (conf) {
            $scope.config = conf;
        };

        function getScheduleTemp(calendar) {
            var timeNow = moment().format("HH:mm");
            var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

    return {
        getHTML: function () {
            return getCSS() + getHTML();
        },
        getController: getController
    };
    // return getCSS() + html;
};