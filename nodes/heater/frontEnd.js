'use strict';
const path = require("path");
class FrontEnd {
    #config = undefined;
    #serverURL = undefined;
    #frontConfigOptions = [
        'id',
        'title',
        'calendar',
        'unit',
        'sliderMaxValue',
        'sliderMinValue',
        'sliderStep'
    ]

    constructor(config, serverURL) {
        this.#config = config;
        this.#serverURL = serverURL;
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
        frontEndConf['wsURL'] = this.#serverURL;
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
        $scope.connectToWS = function (url) {
            var url = new URL($scope.config.wsURL, window.location.href);
            url.protocol = 'ws:';
            const socket = new WebSocket(url.href);

            // Connection opened
            socket.addEventListener('open', function (event) {
                $scope.socket = socket;
                // socket.send('connection');
            });

            // Listen for messages
            socket.addEventListener('message', function (event) {
                //TOOD Add am massage based event listener;
                console.log(event.data);
            });
        }

        var controller = this;
        var triggers = {};
        $scope.init = function () {
            /*$scope.config*/
            $scope.connectToWS();
            // triggers['status'] = $scope.statusChangedEvent;
            // $scope.$watch("msg", $scope.eventDispatcher.bind(controller));
        };
        // $scope.eventDispatcher = function (msgs, b, $scope, d, e) {
        //     if (typeof (msgs) === 'undefined') return;
        //     for (var i in msgs) {
        //         if (typeof (msgs[i].topic) !== 'string') {
        //             console.debug('Topic is not a string: ', msgs[i]);
        //         }
        //         triggers[msgs[i].topic](msgs[i].payload);
        //     }
        // }

        $scope.statusChangedEvent = function (payload) {
            // $scope.status = payload;
            debugger;
        }

        $scope.changeTemp = function () {
            $scope.socket.send('messageByThe button');
        }
    }

}

module.exports = FrontEnd;