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
                var backModule = new BackEndNode(node, config);
                node.config = backModule.getAdaptedConfig();

                done = ui.addWidget(Object.assign({
                    node: node,
                    width: config.width,
                    height: config.height,
                    group: config.group
                }, backModule.getWidget()));
            } catch (error) {
                node.error(RED._(error));
                throw error;
            }
        } catch (e) {
            console.log(e);
        }
        node.on("close", function () {
            console.log('done');
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('heater-controller', getNode);
};