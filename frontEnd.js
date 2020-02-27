'use strict';

function getHTML(config) {
    var fs = require('fs');
    var htmlFile = 'frontEndButtons.html';
    if (config.displayMode !== 'buttons') {
        htmlFile = 'frontEndSlider.html';
    }
    return '<style>' + fs.readFileSync('frontEnd.css', 'utf8') + '</style>' + fs.readFileSync(htmlFile, 'utf8').replace('\${confString}', JSON.stringify(config));
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
            return getHTML(config);
        },
        getController: getController
    };
};