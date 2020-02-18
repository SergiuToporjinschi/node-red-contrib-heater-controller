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
            //initialize backEnd module
            var done = null;
            try {
                var BackEndNode = require('./backEndNode.js');
                // var backModule = new BackEndNode(config, node);
                var backModule = new BackEndNode(config, {
                    context: node.context(),
                    send:  function () { return node.send.apply(node, arguments); },
                    error: node.error
                });

                // var frontConf = 
                var frontEnd = require('./frontEnd').init({
                    calendar: config.calendar,
                    unit: config.unit,
                    title: config.title,
                    displayMode: config.displayMode,
                    sliderStep: config.sliderStep,
                    sliderMinValue: config.sliderMinValue,
                    sliderMaxValue: config.sliderMaxValue
                });
                
                var html = frontEnd.getHTML();

                node.config = backModule.getAdaptedConfig();

                done = ui.addWidget(Object.assign({
                    node: node,
                    width: parseInt(config.width),
                    height: parseInt(config.height),
                    group: config.group,
                    order: config.order || 0
                }, 
                {
                    format: html,
                    templateScope: "local",
                    emitOnlyNewValues: false,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: true,
                    initController: frontEnd.getController,
                    beforeEmit: function () { return backModule.beforeEmit.apply(backModule, arguments); },
                    beforeSend: function () { return backModule.beforeSend.apply(backModule, arguments); }
                }));
            } catch (error) {
                throw error;
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
    RED.nodes.registerType('ui_heater_controller', getNode);
};