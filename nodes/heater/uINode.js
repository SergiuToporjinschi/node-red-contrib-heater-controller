var _ = require('lodash');
var FrontEnd = require('./frontEnd')
const WsServer = require('./webSocketServer')
const frontConfigOptions = [
    'title',
    'topic',
    'logLength',
    'threshold',
    'calendar',
    'unit',
    'displayMode',
    'sliderMaxValue',
    'sliderMinValue',
    'sliderStep'
];
const frontEndTopics = ['status', 'config'];
class UINode {
    status = undefined;
    config = undefined;
    #events = {};
    #ui = undefined;
    #doneUI = undefined;
    #RED = undefined;
    #wsServer = undefined;
    constructor(RED, config) {
        this.config = config;
        this.#RED = RED;
        try {
            if (this.#ui === undefined) {
                this.#ui = RED.require('node-red-dashboard')(RED);
            }
            RED.nodes.createNode(this, this.config);
            this.startSocketIOServer();
            this._createWidget();
            this.on('input', this.input.bind(this));
        } catch (error) {
            this.error(error);
            throw error;
        }
        this.on('close', this._close.bind(this));
    }

    addEvent(topic, func) {
        if (typeof (topic) !== 'string' || typeof (func) !== 'function') {
            this.error('Invalid arguments [topic:string, func:function]');
            throw new Error('Invalid arguments [topic:string, func:function]');
        }
        this.#events[topic] = func;
        if (topic === 'userConfig') { //Front-end request bind to the input back-end
            this.#wsServer.registerIncomingEvents(topic, this.receive.bind(this), this.id);
        }
    }

    removeEvent(topic) {
        if (typeof (topic) !== 'string') {
            this.error('Invalid argument [topic:string]');
            throw new Error('Invalid argument [topic:string]');
        }
        delete this.#events[topic];
    }

    startSocketIOServer() {
        this.#wsServer = WsServer.createInstance(this.#RED, this.id);
        this.#wsServer.registerIncomingEvents('connection', this._newClientConnected.bind(this), this.id);
    }

    filterConfig(config) {
        var frontEndConf = {};
        for (var i in frontConfigOptions) {
            var key = frontConfigOptions[i];
            frontEndConf[key] = config[key];
        }
        return frontEndConf;
    }

    _newClientConnected() {
        this.#wsServer.send(this.id, 'config', this.filterConfig(this.config));
        this.#wsServer.send(this.id, 'status', this.status);
    }

    sendStatus() {
        this.#wsServer.send(this.id, 'status', this.status);
    }

    /**
     * @private
     *
     * Called when the node needs to be unloaded
     * - Calls onClose if there is an implementation of it;
     * - call dashboard remove node if any;
     */
    _close(resolve) {
        this.debug('Close called');
        this.#wsServer.unRegister(this.id);
        if (this.onClose) {
            this.onClose();
        }
        if (this.#doneUI) {
            this.#doneUI();
        }
        resolve();
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
        this.debug('input: ' + JSON.stringify(msg));
        try {
            this._messageIn(msg, send);
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
        this.debug('createWidget called');
        try {
            var frontEnd = new FrontEnd();
            var frontEndHtml = frontEnd.getHTML(this.config.displayMode, this.#ui.isDark(), this.#ui.getTheme());
            var frontEndController = frontEnd.getController(this.#wsServer.getURL(this.id));
            this.#doneUI = this.#ui.addWidget(Object.assign({
                node: this,
                width: parseInt(this.config.width),
                height: parseInt(this.config.height),
                group: this.config.group,
                order: this.config.order || 0
            }, {
                format: frontEndHtml,
                templateScope: 'local',
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
    _messageIn(msg, send) {
        if (typeof (msg) !== 'object' || typeof (msg.topic) !== 'string') {
            this.error('Invalid Topic!!! ', msg);
            throw new Error('Invalid Topic!!!');
        }
        //clones initial status
        this.oldStatus = _.cloneDeepWith(this.status, function (value) {
            /* istanbul ignore next */
            if (_.isFunction(value)) {
                return;
            }
        });

        //process message;
        var resp;
        var eventItem = this.#events[msg.topic];
        if (eventItem) {
            resp = eventItem.call(this, msg);
        } else {
            this.error('Calling unregistered event: ' + msg.topic);
            throw new Error('Calling unregistered event: ' + msg.topic);
        }

        if (typeof (resp) === 'undefined') return;

        this._sendToFrontEnd(resp); //send messages to front-end if any
        this._sendOutPut(resp, send, msg._msgid); //send message to back-end if any
    }

    _sendOutPut(msg, send, id) {
        if (typeof (msg) !== 'object') return;
        var heaterStatus = typeof (msg.heaterStatus) !== 'undefined' ? { topic: this.config.topic, payload: msg.heaterStatus } : undefined;
        delete msg.heaterStatus;
        if (typeof (heaterStatus) !== 'undefined') {
            send([heaterStatus]);
        }
        for (var i in msg) {
            var message = { topic: i, payload: msg[i] };
            if (id) { message._msgid = id; }
            send([undefined, message]);
        }
    }

    _sendToFrontEnd(obj) {
        for (var i in frontEndTopics) {
            var topic = frontEndTopics[i];
            var payload = obj[topic];
            if (!['undefined', 'function'].includes(typeof (payload)))
                this.#wsServer.send(this.id, topic, payload);
        }
    }
}
module.exports = UINode;