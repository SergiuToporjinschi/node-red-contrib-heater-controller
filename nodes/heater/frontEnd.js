'use strict';
const path = require("path");
class FrontEnd {
    #config = undefined;
    #frontConfigOptions = [
        'title',
        'calendar',
        'unit',
        'sliderMaxValue',
        'sliderMinValue',
        'sliderStep'
    ]
    constructor(config, isDark) {
        this.#config = config;
        this.isDark = isDark;
    }
    getHTML(isDark) {
        //TODO take in consideration isDark theme;
        var fs = require('fs');
        var htmlFile = 'frontEndButtons.html';
        if (this.#config.displayMode !== 'buttons') {
            htmlFile = 'frontEndSlider.html';
        }
        var cssContent = fs.readFileSync(path.resolve(__dirname, './', 'frontEnd.css'), 'utf8');
        var htmlContent = fs.readFileSync(path.resolve(__dirname, './', htmlFile), 'utf8');
        return '<style>' + cssContent + '</style>' + htmlContent;
    }

    getController() {
        var functionBody = this._controller.toString();
        var frontEndConf = {};
        for (var i in this.#frontConfigOptions) {
            var key = this.#frontConfigOptions[i];
            frontEndConf[key] = key === 'calendar' ? JSON.parse(this.#config[key]) : this.#config[key];
        }
        functionBody = functionBody.replace('/*$scope.config*/', ' $scope.config = ' + JSON.stringify(frontEndConf) + ';');
        return eval('(function ' + functionBody + ')');
    }

    /**
     * This method is running in browser/Front-end therefore skipped for code-coverage
     * @param {$scope} $scope
     * @param {events} events
     */
    /* istanbul ignore next */
    _controller($scope, events) {
        debugger;
        var controller = this;
        var events = {};
        $scope.init = function () {
            /*$scope.config*/
            events['status'] = $scope.statusChangedEvent;
            $scope.$watch("msg", $scope.eventDispatcher.bind(controller));
        };
        $scope.eventDispatcher = function (msgs, b, $scope, d, e) {
            if (typeof (msgs) === 'undefined') return;
            for (var i in msgs) {
                if (typeof (msgs[i].topic) !== 'string') {
                    console.debug('Topic is not a string: ', msgs[i]);
                }
                events[msgs[i].topic](msgs[i].payload);
            }
        }

        $scope.statusChangedEvent = function (payload) {
            $scope.status = payload;
            debugger;
        }



        $scope.changeTemp = function () {
        }
        // $scope.showLogs = function () {
        //     // $scope.sendValue("showLogs");
        //     $scope.msg.action = "showLogs";
        //     $scope.sendVal();
        //     // for (var i in $scope.msg.logs) {
        //     //     console.log($scope.msg.logs[i]);
        //     // }
        // }
        // //"update-value"
        // //front->back
        // $scope.toSchedule = function () {
        //     if ($scope.msg && $scope.msg.isUserCustom) {
        //         $scope.msg.isUserCustom = false;
        //         $scope.msg.targetValue = $scope.msg.temp;
        //         $scope.send($scope.msg);
        //     }
        // };
        // //front->back
        // $scope.sendVal = function (event) {
        //     if (!$scope.msg.userTargetValue) {
        //         $scope.msg.userTargetValue = $scope.config.sliderMinValue;
        //     }
        //     $scope.msg.targetValue = $scope.msg.userTargetValue;
        //     $scope.msg.isUserCustom = true;
        //     $scope.send($scope.msg);
        //     if (event && event.stopPropagation) {
        //         event.stopPropagation();
        //     }
        // };
        // //front->back
        // $scope.lockCustom = function () {
        //     if ($scope.msg) {
        //         $scope.msg.isLocked = !$scope.msg.isLocked;
        //         $scope.sendVal();
        //     }
        // };

        // $scope.changeTemp = function (direction) {
        //     if (!$scope.msg.userTargetValue) {
        //         $scope.msg.userTargetValue = $scope.msg.currentTemp;
        //     }
        //     if (direction === '+') {
        //         $scope.msg.userTargetValue = $scope.msg.targetValue + $scope.config.sliderStep;
        //     } else {
        //         $scope.msg.userTargetValue = $scope.msg.targetValue - $scope.config.sliderStep;
        //     }
        //     if ($scope.config.sliderMinValue >= $scope.msg.userTargetValue) {
        //         $scope.msg.userTargetValue = $scope.config.sliderMinValue;
        //     }
        //     if ($scope.config.sliderMaxValue <= $scope.msg.userTargetValue) {
        //         $scope.msg.userTargetValue = $scope.config.sliderMaxValue;
        //     }
        //     $scope.msg.isUserCustom = true;
        //     $scope.send($scope.msg);
        // }

    }

}

module.exports = FrontEnd;