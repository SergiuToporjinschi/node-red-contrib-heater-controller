/* eslint no-console: ["error", { allow: ["warn", "error", "debug"] }] */
'use strict';
const path = require('path');
class FrontEnd {
    constructor() {
    }

    getHTML(displayMode, isDark, theme) {
        //TODO take in consideration isDark theme;
        var fs = require('fs');
        var htmlFile = 'frontEndButtons.html';
        if (displayMode !== 'buttons') {
            htmlFile = 'frontEndSlider.html';
        }
        const currentDirName = path.resolve(path.dirname('./nodes/heater/./'));
        var cssContent = fs.readFileSync(path.resolve(currentDirName, 'frontEnd.css'), 'utf8');
        var htmlContent = fs.readFileSync(path.resolve(currentDirName, htmlFile), 'utf8');
        return '<style>' + cssContent + '</style>' + htmlContent;
    }

    getController(serverURL) {
        var functionBody = this._controller.toString();
        functionBody = functionBody.replace('/*$scope.serverURL*/', ' $scope.serverURL = "' + serverURL + '";');
        return eval('(function ' + functionBody + ')');
    }

    /**
     * This method is running in browser/Front-end therefore skipped for code-coverage
     * @param {$scope} $scope
     * @param {events} events
     */
    /* istanbul ignore next */
    _controller($scope) {
        $scope.userConfigAttributes = ['isLocked', 'userTargetValue', 'isUserCustom'];
        $scope.connectToWS = function () {
            var url = new URL($scope.serverURL, window.location.href);
            url.protocol = 'ws:';
            $scope.socket = new WebSocket(url.href);
            $scope.socketEvents = {
                config: $scope.configReceived,
                status: $scope.statusReceived,
            };

            // Connection opened
            $scope.socket.addEventListener('open', function () {
                console.debug('Connected...');
            });
            $scope.socket.addEventListener('close', function () {
                console.debug('connection closed');
            });

            // Listen for messages
            $scope.socket.addEventListener('message', function (event) {
                console.debug('MessageReceived ', $scope.serverURL);
                if (typeof (event.data) !== 'string') {
                    console.error('Invalid messaged received!!!', event.data);
                    return;
                }
                var msg;
                try {
                    msg = JSON.parse(event.data);
                } catch (error) {
                    console.error('Cannot parse incoming message', error);
                    return;
                }
                var func = undefined;
                if (typeof (msg.topic) !== 'string' || typeof (func = $scope.socketEvents[msg.topic]) !== 'function') {
                    console.error('Invalid topic received', event.data);
                    return;
                }
                func.call($scope, msg.payload);
            });
        }

        $scope.configReceived = function (payload) {
            $scope.config = typeof ($scope.config) === 'undefined' ? {} : $scope.config;
            Object.assign($scope.config, payload);
            $scope.$apply();
        }

        $scope.statusReceived = function (payload) {
            $scope.status = typeof ($scope.status) === 'undefined' ? {} : $scope.status;
            Object.assign($scope.status, payload);
            if (typeof ($scope.status.userTargetValue) === 'undefined') {
                $scope.status.userTargetValue = $scope.status.targetValue;
            }
            $scope.$apply();
        }

        $scope.getTransformStatus = function () {
            var userPayload = {};
            for (var i in $scope.status) {
                if ($scope.userConfigAttributes.includes(i)) {
                    userPayload[i] = $scope.status[i];
                }
            }
            return Object.keys(userPayload).length > 0 ? { payload: userPayload } : undefined;
        };

        $scope.sendStatus = function () {
            var statusToSend = $scope.getTransformStatus();
            if (typeof (statusToSend) === undefined) {
                console.error('Invalid status');
                throw new Error('Invalid status');
            }
            statusToSend.topic = 'userConfig';
            $scope.socket.send(JSON.stringify(statusToSend));
        };

        $scope.init = function () {
            /*$scope.serverURL*/
            $scope.connectToWS();
        };

        $scope.isLocked = function () {
            $scope.status.isLocked = !$scope.status.isLocked;
            $scope.status.isUserCustom = true;
            $scope.sendStatus();
        };

        $scope.userTargetChanged = function () {
            //Set this as initial status but after sending the new settings we will have a refreshed status with the real values
            $scope.status.targetValue = $scope.status.userTargetValue;
            $scope.status.isUserCustom = true;
            $scope.sendStatus();
        };

        $scope.toSchedule = function () {
            //Set this as initial status but after sending the new settings we will have a refreshed status with the real values
            $scope.status.targetValue = $scope.status.currentSchedule.temp;
            $scope.status.userTargetValue = $scope.status.targetValue;
            $scope.status.isUserCustom = false;
            $scope.sendStatus();
        };
    }
}

module.exports = FrontEnd;