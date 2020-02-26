'use strict';
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
        .wrapper {
            margin-left: 14px;
            margin-right: 14px;
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
        .link-pointer {
            cursor: pointer;
        }
        .no-select:focus {
            outline: none;
            -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none; /* Safari */
            -khtml-user-select: none; /* Konqueror HTML */
            -moz-user-select: none; /* Firefox */
            -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
        }
        .user-mode {
            color: rgb(63,81,181) !important;
        }
        .info {
            margin-right: 10px;
        }
        .btns .info .item {
            margin-bottom: 7px
        }
        .btns .icon-disabled {
            color: gray;
        }
        .btns .icon-enabled {
            color:#0094ce;
        }
        .btns .temp {
            color: #0094ce;
            font-size: 3em;
            font-weight: bold;
            text-align: center;
        }
        </style>`;
}

function getHTML(config) {
    var confString = JSON.stringify(config);
    if (config.displayMode === 'buttons') {
        return String.raw`
        <p ng-if="config.title" class="nr-dashboard-cardtitle">{{config.title}}</p>
    <div class='btns' layout="row" flex layout-align="space-between stretch" ng-init='init(${confString})'>
        <div layout="column" layout-align="space-between start" flex="41" class="warning-icon info">
            <span ng-show="msg.currentSchedule != undefined" title="Current calendar temp" class="item"><i class="fa fa-calendar-o" aria-hidden="true"></i>{{msg.currentSchedule.temp}}&deg;{{config.unit}} ({{msg.currentSchedule.time}})</span>
            <span ng-show="msg.nextSchedule != undefined" class="item" title="Next calendar temp" ><i class="fa fa-calendar-plus-o" aria-hidden="true"></i>{{msg.nextSchedule.temp}}&deg;{{config.unit}} ({{msg.nextSchedule.time}})</span>
            <span ng-show="msg.currentTemp" class="item" ><i class="fa fa-thermometer-3" aria-hidden="true"></i>{{msg.currentTemp | number:1}}&deg;{{config.unit}}</span>
            <div layout="row" layout-align="space-between start" class="item">
                <i title="Calendar is missing" class="fa fa-calendar" style="color:red" aria-hidden="true" ng-if="!config.calendar"></i>
                <i title="Current temperature is missing" ng-class="{'user-mode': msg.isUserCustom}" class="fa fa-thermometer-empty" style="color:red" aria-hidden="true" ng-if="!msg.currentTemp"></i>
                <i ng-show="msg.currentTemp" title="Heater status" class="fa fa-fire icon" ng-class="msg.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" aria-hidden="true"></i>
            </div>
            <div flex layout="row" ng-show="msg.currentTemp">
                <div class="item"><i ng-click='lockCustom()' ng-class="msg.isUserCustomLocked ? 'fa-lock' : 'fa-unlock-alt'" class="fa no-select link-pointer" style="font-size: 2.2em; color:#0094ce"></i></div>
                <div class="item"><i ng-click='toSchedule()' ng-class="{'icon-enabled link-pointer' : msg.isUserCustom, 'icon-disabled' : !msg.isUserCustom}" class="fa fa-calendar-check-o no-select" style="font-size: 2em"></i></div>
                <div class="item"><i ng-click="showLogs()" title="Logs" ng-class="{'icon-enabled ':msg.logs.length > 0, 'icon-disabled' : !msg.logs || msg.logs.length <= 0 }" class="fa fa-file-text-o no-select" style="font-size: 2em"></i></div>
            </div>
        </div>
        <div layout="column" layout-align="stretch" flex class="container ">{{ msg.isUserCustom}}
            <md-button ng-click="changeTemp('+')" ng-disabled="!msg || !msg.currentTemp" md-no-ink class="md-raised"><i class="fa fa-chevron-up" style="max-hei"></i></md-button>
            <span ng-class="{'user-mode': msg.isUserCustom}" class="temp no-select link-pointer" md-swipe-left="toSchedule()" md-swipe-right="toSchedule()" ng-dblclick="toSchedule()" title="Current target (user value or calendar). Double-click for reset." >{{msg.targetValue | number:1}}&deg;{{config.unit}}</span>
            <md-button ng-click="changeTemp('-')" ng-disabled="!msg || !msg.currentTemp" md-no-ink class="md-raised"style="margin:0px"><i class="fa fa-chevron-down" ></i></md-button>
        </div>
    </div>`;
    } else
        return String.raw`
    <div class='wrapper' layout="column" flex layout-align="center stretch" ng-init='init(${confString})'>
        <p ng-if="config.title" class="nr-dashboard-cardtitle">{{config.title}}</p>
        <div layout="row" layout-align="end center" class="warning-icon">
            <span class="info" title="Current calendar temp" ng-show="msg.currentSchedule != undefined"><i class="fa fa-calendar-o" aria-hidden="true"></i>{{msg.currentSchedule.temp}}&deg;{{config.unit}} ({{msg.currentSchedule.time}})</span>
            <span class="info" title="Next calendar temp" ng-show="msg.nextSchedule != undefined"><i class="fa fa-calendar-plus-o" aria-hidden="true"></i>{{msg.nextSchedule.temp}}&deg;{{config.unit}} ({{msg.nextSchedule.time}})</span>
            <span class="info" title="Logs" ng-show="msg.logs.length > 0" ng-click="showLogs()"><i class="fa fa-file-text-o" aria-hidden="true"></i></span>
            <div flex></div>
            <i title="Calendar is missing" class="fa fa-calendar" style="color:red" aria-hidden="true" ng-if="!config.calendar"></i>
            <i title="Current temperature is missing" class="fa fa-thermometer-empty"  style="color:red" aria-hidden="true" ng-if="!msg.currentTemp"></i>
        </div>
        <div layout="row" layout-align="center center" class="container">
            <div layout-align="start center" flex="20"><i ng-click='lockCustom()' ng-class="msg.isUserCustomLocked ? 'fa-lock' : 'fa-unlock-alt'" class="fa no-select link-pointer" style="font-size: 2em; color:#0094ce"></i></div>
            <div layout="row" layout-align="center center" flex>
                <div layout-align="end center" layout="column">
                    <div title="Current target (user value or calendar). Double-click for reset." ng-class="{'user-mode': msg.isUserCustom}" class="temp no-select link-pointer" md-swipe-left="toSchedule()" md-swipe-right="toSchedule()" ng-dblclick="toSchedule()">{{msg.targetValue | number:1}}&deg;{{config.unit}}</div>
                </div>
                <div class='heaterContr' layout-align="center center" layout="column">
                    <div class="targetTemp" flex="50">{{msg.currentTemp | number:1}}</div>
                    <div layout-align="space-between" layout="row" flex="50">
                        <i title="Heater status" class="fa fa-fire icon" ng-class="msg.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>
        <div layout-align="center stretch" layout="column">
            <md-slider md-discrete ng-disabled='!msg || !msg.targetValue || !msg.currentTemp' ng-change="sendVal()" class="md-primary" ng-model="msg.userTargetValue" step="{{config.sliderStep}}" min="{{config.sliderMinValue}}" max="{{config.sliderMaxValue}}">
        </div>
    </div>`;
}

function getController($scope, events) {
    $scope.init = function (config) {
        $scope.config = config;
        $scope.$watch("msg", function (a, b, c) {
            debugger;
        });
    };
    $scope.showLogs = function () {
        // $scope.sendValue("showLogs");
        $scope.msg.action = "showLogs";
        $scope.sendVal();
        // for (var i in $scope.msg.logs) {
        //     console.log($scope.msg.logs[i]);
        // }
    }
    //"update-value"
    //front->back
    $scope.toSchedule = function () {
        if ($scope.msg && $scope.msg.isUserCustom) {
            $scope.msg.isUserCustom = false;
            $scope.msg.targetValue = $scope.msg.temp;
            $scope.send($scope.msg);
        }
    };
    //front->back
    $scope.sendVal = function (event) {
        if (!$scope.msg.userTargetValue) {
            $scope.msg.userTargetValue = $scope.config.sliderMinValue;
        }
        $scope.msg.targetValue = $scope.msg.userTargetValue;
        $scope.msg.isUserCustom = true;
        $scope.send($scope.msg);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
    };
    //front->back
    $scope.lockCustom = function () {
        if ($scope.msg) {
            $scope.msg.isUserCustomLocked = !$scope.msg.isUserCustomLocked;
            $scope.sendVal();
        }
    };
    $scope.changeTemp = function (direction) {
        if (!$scope.msg.userTargetValue) {
            $scope.msg.userTargetValue = $scope.msg.currentTemp;
        }
        if (direction === '+') {
            $scope.msg.userTargetValue = $scope.msg.targetValue + $scope.config.sliderStep;
        } else {
            $scope.msg.userTargetValue = $scope.msg.targetValue - $scope.config.sliderStep;
        }
        if ($scope.config.sliderMinValue >= $scope.msg.userTargetValue) {
            $scope.msg.userTargetValue = $scope.config.sliderMinValue;
        }
        if ($scope.config.sliderMaxValue <= $scope.msg.userTargetValue) {
            $scope.msg.userTargetValue = $scope.config.sliderMaxValue;
        }
        $scope.msg.isUserCustom = true;
        $scope.send($scope.msg);
    }
}
module.exports.init = function (config) {
    return {
        getHTML: function () {
            return getCSS() + getHTML(config);
        },
        getController: getController
    };
};