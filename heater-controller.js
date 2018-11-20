module.exports = function(RED) {
    var line2class = {
        "one" : null,
        "two" : "md-2-line",
        "three" : "md-3-line"
    };

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("heater-controller.error.no-group"));
            return false;
        }
        return true;
    }

    function HTML(config) {debugger;
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
		.targetTemp {
			color: #0094ce;
			font-size: 1em;
			font-weight: bold;
		}
		.heaterContr {
		  margin-left: 10px;
		}
		.temp {
			color: #0094ce;
			font-size: 4em;
			font-weight: bold;
		}
		</style>`
		var html = String.raw`
		<div layout="column" flex layout-align="center stretch">
			<div layout="row"  layout-align="center center" class="container" flex>
			  <div layout-align="end center" layout="column">
				  <div class="temp">{{msg.items.currentTemp | number:1}}&deg;C</div>
			  </div>
			  <div class='heaterContr' layout-align="center center" layout="column">
				  <div class="targetTemp">{{msg.items.targetTemp | number:1}}</div>
				  <i ng-class="msg.items.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" class="fa fa-fire icon" aria-hidden="true"></i>
			  </div>
			</div>
			<div layout-align="center stretch"  layout="column">
				<md-slider ng-change="sendVal()" class="md-primary" ${(config.sliderSteps ? "md-discrete" : "")} ng-model="targetValue" step="${config.sliderStep}" min="${config.sliderMinValue}" max="${config.sliderMaxValue}">
			</div>
		</div>`
        return css + html;
    };

    var ui = undefined;
    function ListNode(config) {
        try {
            var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var done = null;
            if (checkConfig(node, config)) {
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
                    storeFrontEndInputAsState: false,
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function(msg, value) {
                        return { msg: { items: value } };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return orig.msg;
                        }
                    },
                    initController: function($scope, events) {
						$scope.targetValue = 10;
                        $scope.sendVal = function() {
                            $scope.send({payload: $scope.targetValue});
                        };
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", function() {
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('heater-controller', ListNode);
};