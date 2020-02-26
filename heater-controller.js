/**
 * Creates the back-end module
 * @param {object} config object from back-end 
 * @param {object} node an existing node-red node
 */
function getBackModule(config, node) {
    var BackEndNode = require('./backEndNode.js');
    // var backModule = new BackEndNode(config, node);
    var backModule = new BackEndNode(config, {
        context: node.context(),
        send: function () { return node.send.apply(node, arguments); },
        error: node.error,
        log: node.log,
        warn: node.warn
    });
    return backModule;
}

/**
 * Creates Front-end Module
 * @param {object} config object from back-end
 */
function getFrontModule(config) {
    return require('./frontEnd').init({
        calendar: config.calendar,
        unit: config.unit,
        title: config.title,
        displayMode: config.displayMode,
        sliderStep: config.sliderStep,
        sliderMinValue: config.sliderMinValue,
        sliderMaxValue: config.sliderMaxValue
    });
}

/**
 * @returns {function} done function for undeploying the node
 * @param {object} config object from back-end 
 * @param {object} node an existing node-red node 
 * @param {object} ui node-red-dashboard node
 */
function createWidget(config, node,  ui) {
    try {
        var backModule = getBackModule(config, node);
        var frontEnd = getFrontModule(config);
        var html = frontEnd.getHTML();
        node.config = backModule.getAdaptedConfig();
        done = ui.addWidget(Object.assign({
            node: node,
            width: parseInt(config.width),
            height: parseInt(config.height),
            group: config.group,
            order: config.order || 0
        }, {
            format: html,
            templateScope: "local",
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: true,
            initController: frontEnd.getController,
            beforeEmit: function () { return backModule.beforeEmit.apply(backModule, arguments); },
            beforeSend: function () { return backModule.beforeSend.apply(backModule, arguments); }
        }));
    }
    catch (error) {
        throw error;
    }
    return done;
}

module.exports = function (RED) {
    'use strict';
    var ui = undefined;
    function getNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var done = createWidget(config, node, ui);
        } catch (e) {
            console.log(e);
        }
        node.on("close", function () {
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('ui_heater_controller', getNode);
};