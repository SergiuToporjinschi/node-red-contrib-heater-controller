var _ = require('lodash');
var FrontEnd = require('./frontEnd')
const WsServer = require('./webSocketServer')
class UINode {
    status = undefined;
    config = undefined;
    #events = {};
    #ui = undefined;
    #doneUI = undefined;
    #RED = undefined;
    #wsServerURL = undefined;
    #wsServer = undefined;
    #frontConfigOptions = [
        'title',
        'calendar',
        'unit',
        'sliderMaxValue',
        'sliderMinValue',
        'sliderStep'
    ]
    constructor(RED, config) {
        this.config = config;
        this.#RED = RED;
        try {
            if (this.#ui === undefined) {
                this.#ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, this.config);
            this.startSocketIOServer();
            this._createWidget();
            this.on("input", this.input.bind(this));
        } catch (error) {
            this.error(error);
            throw error;
        }
        this.on("close", this._close);
    }

    addEvent(topic, func) {
        if (typeof (topic) !== 'string' || typeof (func) !== 'function') {
            this.error("Invalid arguments [topic:string, func:function]");
            throw new Error("Invalid arguments [topic:string, func:function]");
        }
        this.#events[topic] = func;
    }

    removeEvent(topic) {
        if (typeof (topic) !== 'string') {
            this.error("Invalid argument [topic:string]");
            throw new Error("Invalid argument [topic:string]");
        }
        delete this.#events[topic];
    }

    startSocketIOServer() {
        this.#wsServer = new WsServer(this.#RED, this.id);
        this.#wsServerURL = this.#wsServer.start();
        this.#wsServer.registerIncomingEvents('connection', this._newClientConnected, this);
    }

    _createClientConfig() {
        var frontEndConf = {};
        for (var i in this.#frontConfigOptions) {
            var key = this.#frontConfigOptions[i];
            frontEndConf[key] = this.config[key];
        }
        return frontEndConf;
    }

    _newClientConnected(ws) {
        this.#wsServer.send('config', this._createClientConfig(), ws);
    }

    /**
     * @private
     *
     * Called when the node needs to be unloaded
     * - Calls onClose if there is an implementation of it;
     * - call dashboard remove node if any;
     */
    _close() {
        this.debug("Close called");
        this.#wsServer.shutdownServer();
        if (this.onOnClose) {
            this.onClose();
        }
        if (this.#doneUI) {
            this.#doneUI();
        }
    }

    /**
     * @private
     *
     * Called when a new message arrives
     *  - Calls onInput if there is an implementation of it;
     *  - Calls the end process method if nodeJS > 1.0
     *  - In case of an error throws it to nodeJS for handling
     * @param {Object} msg the message
     * @param {function} send function for sending a message from output
     * @param {function} doneCB function to call when processing is finished or an error occurred
     */
    input(msg, send, doneCB) {
        this.debug("input:", msg);
        try {
            var retMsg = this._messageIn(msg);
            if (typeof (retMsg) === 'undefined') return;
            var statusIndex = _.findIndex(retMsg, o => {
                return typeof (o) !== 'undefined' && o.topic === 'status';
            });
            var heaterStatusIndex = _.findIndex(retMsg, o => {
                return typeof (o) !== 'undefined' && o.topic === 'heaterStatus';
            });
            send([
                retMsg[heaterStatusIndex],
                retMsg[statusIndex]
            ]);

            if (doneCB) {
                doneCB();
            }
        } catch (err) {
            // my error message is not showing up because of ui
            this.error(err, msg);
            if (doneCB) {
                // Node-RED 1.0 compatible
                doneCB(err);
            }
        }
    }

    /**
     * @private
     *
     * Called in constructor to build the interface
     */
    _createWidget() {
        this.debug("createWidget called");
        try {
            var frontEnd = new FrontEnd();
            var frontEndHtml = frontEnd.getHTML(this.config.displayMode, false);
            var frontEndController = frontEnd.getController(this.#wsServerURL);
            this.#doneUI = this.#ui.addWidget(Object.assign({
                node: this,
                width: parseInt(this.config.width),
                height: parseInt(this.config.height),
                group: this.config.group,
                order: this.config.order || 0
            }, {
                format: frontEndHtml,
                templateScope: "local",
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: true,
                initController: frontEndController
            }));
        } catch (error) {
            this.error(error);
            throw error;
        }
    }

    /**
     * back to front
     * Called before a new message arrives
     * @param {Object} msg the message
     */
    _messageIn(msg) {
        if (typeof (msg) !== 'object' || typeof (msg.topic) !== 'string') {
            this.error('Invalid Topic!!! ', msg);
            throw new Error('Invalid Topic!!!');
        }
        //clones initial status
        this.oldStatus = _.cloneDeepWith(this.status, function (value) {
            if (_.isFunction(value)) {
                return;
            }
        });

        var resp;
        var eventItem = this.#events[msg.topic];
        if (eventItem) {
            resp = eventItem.call(this, msg);
        } else {
            this.error('Calling unregistered event: ' + msg.topic);
            throw new Error('Calling unregistered event: ' + msg.topic);
        }
        if (typeof (resp) === 'undefined') return;
        if (!Array.isArray(resp)) {
            resp = [resp];
        }
        this._sendToFrontEnd(resp);
        return resp;
    }

    _sendToFrontEnd(ret) {
        for (var i in ret) {
            var msg = ret[i];
            if (typeof (msg) !== 'undefined' && ['status', 'config'].includes(msg.topic))
                this.#wsServer.broadcast(msg.topic, msg.payload);
        }
    }
}
module.exports = UINode;