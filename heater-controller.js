module.exports = function (RED) {
    'use strict';
    RED.nodes.registerType('ui_heater_controller', require('./heaterLoader').bind(this, RED));
};