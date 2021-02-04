module.exports = function (RED) {
    'use strict';
    RED.nodes.registerType('ui_heater_controller1', require('./heaterLoader').bind(this, RED));
};