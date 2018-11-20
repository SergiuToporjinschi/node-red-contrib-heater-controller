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
		var conf = JSON.stringify(config);
		var html = String.raw`
		<div layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>{{isUserCustom}} - {{userTargetValue}}
			<div layout="row" layout-align="center center" class="container" flex>
				<i ng-click="setUserCustom()" ng-if="userTargetValue" class="fa fa-user-o userSettingsIcon" aria-hidden="true" style="font-size: 36px"></i>
				<div layout-align="end center" layout="column">
					<div class="temp">{{userTargetValue | number:1}}&deg;C</div>
				</div>
				<div class='heaterContr' layout-align="center center" layout="column">
					<div class="targetTemp" flex="50">{{msg.items.currentTemp | number:1}}</div>
					<div layout-align="space-between" layout="row" flex="50">
						<i class="fa fa-fire icon" ng-class="msg.items.currentHeaterStatus == 'on' ? 'iconTrue' : 'iconFalse'" aria-hidden="true"></i>
					</div>
				</div>
			</div>
			<div layout-align="center stretch"	layout="column">
				<md-slider ng-change="sendVal()" class="md-primary" md-discrete ng-model="userTargetValue" step="${config.sliderStep}" min="${config.sliderMinValue}" max="${config.sliderMaxValue}">
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
					convertBack: function (value) {
						return value;
					},
					beforeEmit: function(msg, value) {
						return {msg : {payload: value}};
					},
					// <-- TO backEnd
					beforeSend: function (msg, orig) {
						if (orig) {
							orig.msg.payload.targetValue = orig.msg.payload.userTargetValue;
							return orig.msg;
							/*return {
								payload: {
									targetValue: orig.msg.payload.userTargetValue,
									isUserCustom : orig.msg.payload.isUserCustom
								}
							}*/
						}
					},
					initController: function($scope, events) {
						$scope.init = function(conf) {
							$scope.config = conf;
							$scope.userTargetValue = $scope.userTargetValue;
							$scope.isUserCustom = !!$scope.userTargetValue;
						};
						events.on('update-value', function (msg){
							$scope.userTargetValue = msg.msg.payload.userTargetValue;
							$scope.isUserCustom = !!$scope.userTargetValue;
						});
						$scope.setUserCustom = function(){
							$scope.isUserCustom = false;
							$scope.userTargetValue = undefined;
							$scope.sendVal();
						};
						$scope.sendVal = function() {
							$scope.send({
								payload: {
									userTargetValue :  $scope.userTargetValue,
									isUserCustom : !!$scope.userTargetValue
								}
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