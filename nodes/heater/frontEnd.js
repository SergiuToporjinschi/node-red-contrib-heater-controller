'use strict';
const path = require("path");
class FrontEnd {
    constructor() {
    }

    getHTML(displayMode, isDark) {
        //TODO take in consideration isDark theme;
        var fs = require('fs');
        var htmlFile = 'frontEndButtons.html';
        if (displayMode !== 'buttons') {
            htmlFile = 'frontEndSlider.html';
        }
        var cssContent = fs.readFileSync(path.resolve(__dirname, './', 'frontEnd.css'), 'utf8');
        var htmlContent = fs.readFileSync(path.resolve(__dirname, './', htmlFile), 'utf8');
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
    _controller($scope, events) {
        $scope.connectToWS = function (url) {
            var url = new URL($scope.serverURL, window.location.href);
            url.protocol = 'ws:';
            $scope.socket = new WebSocket(url.href);
            $scope.socketEvents = {
                config: $scope.configReceived,
                status: $scope.statusReceived,
            };

            // Connection opened
            $scope.socket.addEventListener('open', function (event) {
                console.debug('Connected');
            });
            $scope.socket.addEventListener('close', function (event) {
                console.debug('closed');
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
            console.debug('Config received', payload);
            $scope.config = payload; //TODO maybe we should copy only attributes for not messing-up the links
        }

        $scope.statusReceived = function (payload) {
            console.debug('Status received', payload);
            $scope.status = payload; //TODO maybe we should copy only attributes for not messing-up the links
        }

        $scope.init = function () {
            /*$scope.serverURL*/
            $scope.connectToWS();
        };

        $scope.statusChangedEvent = function (payload) {
            // $scope.status = payload;
            // debugger;
        }

        $scope.changeTemp = function () {
            console.log($scope.config);
            $scope.socket.send(JSON.stringify({
                topic: 'msg',
                payload: 'content!?!?'
            }));
        }
    }

}

module.exports = FrontEnd;