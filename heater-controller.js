module.exports = function(RED) {
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
		.temp {
			color: #0094ce;
			font-size: 4em;
			font-weight: bold;
		}
		</style>`
		var conf = JSON.stringify(config);console.log( 'html:' , conf);
		var html = String.raw`
		<div layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>{{msg.isUserCustom}} - {{msg.targetValue}} - {{msg.userTargetValue}}
			<div layout="row" layout-align="center center" class="container" flex>
				<i ng-click="toSchedule()" ng-if="msg.userTargetValue" class="fa fa-user-o userSettingsIcon" aria-hidden="true" style="font-size: 36px"></i>
				<div layout-align="end center" layout="column">
					<div class="temp">{{msg.userTargetValue | number:1}}&deg;C</div>
				</div>
				<div class='heaterContr' layout-align="center center" layout="column">
					<div class="targetTemp" flex="50">{{msg.currentTemp | number:1}}</div>
					<div layout-align="space-between" layout="row" flex="50">
						<i class="fa fa-fire icon" ng-class="msg.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" aria-hidden="true"></i>
					</div>
				</div>
			</div>
			<div layout-align="center stretch"	layout="column">
				<md-slider ng-change="sendVal()" class="md-primary" md-discrete ng-model="msg.userTargetValue" step="${config.sliderStep}" min="${config.sliderMinValue}" max="${config.sliderMaxValue}">
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
					storeFrontEndInputAsState: true,
					// --> toFrontEnd
					beforeEmit: function(msg, value) {
						return { msg: value };
					},
					// <-- TO backEnd
					convertBack: function (value) {
						return value;
					},
					beforeSend: function (msg, orig) {console.log("beforeSend"); console.log("msg : " ,  msg);
						if (orig) {
							return { payload: orig.msg}; 
						}
					},
					initController: function($scope, events) {console.log('contr:', $scope.msg);
						$scope.init = function(conf) {console.log('init');
							$scope.config = conf;
						};
						$scope.toSchedule = function(){
							$scope.msg.isUserCustom = false;
							$scope.msg.userTargetValue = undefined;
							$scope.sendVal();
						};
						$scope.sendVal = function() {console.log('sendVal');debugger;
							$scope.send({
								userTargetValue : $scope.msg.userTargetValue,
								targetValue : !!$scope.msg.userTargetValue ? $scope.msg.userTargetValue : 999,
								isUserCustom : !!$scope.msg.userTargetValue
							});
						};
					}
				});
			}
		} catch (e) {
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