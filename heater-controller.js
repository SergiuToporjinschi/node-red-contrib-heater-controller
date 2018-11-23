module.exports = function (RED) {
	function checkConfig(node, conf) {
		if (!conf || !conf.hasOwnProperty("group")) {
			node.error(RED._("heater-controller.error.no-group"));
			return false;
		}
		console.log(conf.calendar);
		console.log(adaptCalendar(conf.calendar));
		node.config = adaptCalendar(conf.calendar);
		return true;
	};
	function adaptCalendar(calendar){
		if (calendar) { //TODO a function to convert from string to int if is the case all configurations. 
			calendar = JSON.parse(calendar);
		}
		var newCalendar = {};
		for (var i in calendar){
			newCalendar[i] = {};
			for (var j in calendar[i]){
				var key = j.replace(':','');
				 newCalendar[i][key]= calendar[i][j];
			}
		}
		return newCalendar;
	};
	function storeInContext(node, value) { // TODO maybe I should replace this method or remove it
		node.context().values = node.context().values || {};
		for (var i in value) {
			node.context().values[i] = value[i];
		}
		return node.context().values;
	};
	function storeKeyInContext(node, key, value) {
		node.context().values = node.context().values || {};
		if (key && value) {
			node.context().values[key] = value;
		}
		return node.context().values;
	}

	/**
	 * Decides if we should turn on or off the heater;
	 * @param {currentSettings} status current information about stauts of controller
	 * @param {trashhold} threshold Trashsold to be able to calculate the new status of heater 
	 */
	function recalculateAndTrigger(status, thresholdRising, thresholdFalling) {
		console.log('triggered with: ', status, thresholdRising, thresholdFalling);
		var difference = (status.targetValue - status.currentTemp);
		var newHeaterStatus = (difference < 0 ? "off" : "on");
		var threshold = (newHeaterStatus === "off" ? thresholdRising : thresholdFalling);
		var changeStatus = (Math.abs(difference) >= threshold);
		if (changeStatus != status.currentHeaterStatus) {
			status.currentHeaterStatus = newHeaterStatus;
		}
		return status;
	};
	function HTML(config) {
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
		</style>`
		var conf = JSON.stringify(config);
		var html = String.raw`
		<div layout="column" flex layout-align="center stretch" ng-init='init(${conf})'>
				<div layout="row" layout-align="end center" class="warning-icon" ng-if="!msg.currentTemp" style="color:red">
					<i class="fa fa-calendar" aria-hidden="true" ng-if="!config.calendar"></i>
					<i class="fa fa-thermometer-empty" aria-hidden="true" ng-if="!msg.currentTemp"></i>
				</div>
				<div layout="row" layout-align="center center" class="container">
				<i ng-dblclick="toSchedule()" ng-if="msg.userTargetValue" class="fa fa-user-o userSettingsIcon" aria-hidden="true" style="font-size: 36px"></i>
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
				<md-slider ng-change="sendVal()" class="md-primary slider" md-discrete ng-model="msg.userTargetValue" step="${config.sliderStep}" min="${config.sliderMinValue}" max="${config.sliderMaxValue}">
			</div>
		</div>`
		return css + html;
	};

	var ui = undefined;
	var allowedTopics = ['currentTemp', 'currentHeaterStatus'];
	function ListNode(config) {
		try {
			var node = this;
			if (ui === undefined) {
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
					beforeEmit: function (msg, value) {
						console.log("comming: ", { topic: msg.topic, value: value });
						if (msg.topic === 'calendar') { //TODO de testat, trebuie decis daca ramane sau o scot
							console.log('value: ', value);
							console.log('msg: ', msg);
							node.config.calendar = value;
							return { msg: storeKeyInContext(node) }; //return what I already have
						} else if (allowedTopics.indexOf(msg.topic) < 0) { //if topic is not a safe one just trigger a refresh of UI
							return { msg: storeKeyInContext(node) }; //return what I already have
						}
						var returnValues = storeKeyInContext(node, msg.topic, value);
						if ('currentTemp' === msg.topic) {
							returnValues = recalculateAndTrigger(returnValues, node.config.thresholdRising, node.config.thresholdFalling);
							node.send({ payload: returnValues });
						}
						return { msg: returnValues };
					},
					// <-- TO backEnd
					convertBack: function (value) {
						return value;
					},
					beforeSend: function (msg, orig) {
						if (orig) {
							return { payload: storeInContext(node, recalculateAndTrigger(orig.msg, node.config.thresholdRising, node.config.thresholdFalling)) };
						}
					},
					initController: function ($scope, events) {
						$scope.init = function (conf) {
							$scope.config = conf;
						};
						function getScheduleTemp(calendar) {
							console.log(calendar);
							//calendar[['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday', 'Sunday'][moment().day()]][]
							return 99;
						}	
						$scope.toSchedule = function () {
							$scope.msg.isUserCustom = false;
							$scope.msg.userTargetValue = undefined;
							$scope.sendVal();
						};
						$scope.sendVal = function () {
							$scope.send({
								currentTemp: $scope.msg.currentTemp,
								currentHeaterStatus: $scope.msg.currentHeaterStatus,
								userTargetValue: $scope.msg.userTargetValue,
								targetValue: !!$scope.msg.userTargetValue ? $scope.msg.userTargetValue : getScheduleTemp($scope.config.calendar),//TODO moment target temperature
								isUserCustom: !!$scope.msg.userTargetValue
							});
						};
					}
				});
			}
		} catch (e) {
			console.log(e);
		}
		node.on("close", function () {
			if (done) {
				done();
			}
		});
	}
	RED.nodes.registerType('heater-controller', ListNode);
};