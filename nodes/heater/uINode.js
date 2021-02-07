var _ = require('lodash');
var FrontEnd = require('./frontEnd')
class UINode {
    #events = {};
    #ui = undefined;
    #doneUI = undefined;
    #RED = undefined;
    status = undefined;
    config = undefined;
    #frontEnd = undefined;
    constructor(RED, config) {
        this.config = config;
        this.#RED = RED;
        this.#frontEnd = new FrontEnd(this.config);
        try {
            if (this.#ui === undefined) {
                this.#ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, this.config);
            this._createWidget();
            this.on("input", this.input.bind(this));
        } catch (error) {
            this.error(error);
            throw error;
        }
        this.on("close", this._close);
    }

    addEvent(topic, func) {
        if (!topic || typeof (topic) !== 'string') {
            throw new Error("Invalid argument [topic]");
        }
        if (!func || typeof (func) !== 'function') {
            throw new Error("Invalid argument [func]");
        }
        this.#events[topic] = func;
    }

    removeEvent(topic) {
        if (!topic || typeof (topic) !== 'string') {
            throw new Error("Invalid argument [topic]");
        }
        delete this.#events[topic];
    }

    /**
     * @private
     *
     * Called when the node needs to be unloaded
     * - Calls onClose if there is an implementation of it;
     * - call dashboard remove node if any;
     */
    _close() {
        this.debug("close called");
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
            if (this.onInput) {
                this.onInput(msg, send);
            }
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
            var frontEndHtml = this.#frontEnd.getHTML(this.#ui.isDark());
            var frontEndController = this.#frontEnd.getController();
            // eval(frontEndController.toString());
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
                initController: frontEndController,
                beforeEmit: this.messageIn.bind(this),
                beforeSend: this.messageOut.bind(this)
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
     * @param {Object} fullDataset fullDataset ????? god knows why
     */
    messageIn(msg, fullDataset) {
        if (!msg || typeof (msg) !== 'object' || !msg.topic || typeof (msg.topic) !== 'string') {
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
        }

        //Forward message to front-end
        if (resp) {
            return {
                msg: resp
            };
        }
    }
    /**
     * Called before sending a message from interface
     * @param {Object} msg
     */
    messageOut(x, msg) {
        this.debug("messageOut called: ", msg);
    }

    /**
     * Called to initialize the front end in dashboard
     */
    getFrontModule() {
        return require('./frontEnd').init(this.config);
    }
}
module.exports = UINode;