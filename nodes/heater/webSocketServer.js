const ws = require('ws');
class WebSocketServer {
    #path = 'heaterController/io/';
    #socketURL = '';
    #server = undefined;
    #incomingEvents = {};
    #upgradeRegistered = false;
    constructor(RED, id) {
        var base = RED.settings.httpNodeRoot.endsWith('/') ? RED.settings.httpNodeRoot : RED.settings.httpNodeRoot + '/';
        this.#socketURL = base + this.#path + id;
        RED.server.on('upgrade', this._handleServerUpgrade.bind(this));
    }

    start() {
        this.#server = new ws.Server({ noServer: true });
        this.#server.setMaxListeners(0);
        this.#server.on('connection', this._onClientConnected.bind(this));
        return this.#socketURL;
    }

    shutdownServer() {
        this.#server.close();
    }

    registerIncomingEvents(topic, func, scope) {
        if (typeof (topic) !== 'string' || typeof (func) !== 'function') {
            throw new Error("Invalid arguments [topic:string, func:function]");
        }
        this.#incomingEvents[topic] = {
            func: func,
            scope: scope
        }
    }

    _triggerEvent(topic, message, socket) {
        var event = this.#incomingEvents[topic];
        event.func.call(event.scope, message, socket);
    }

    _handleServerUpgrade(request, socket, head) {
        if (this.#socketURL !== request.url || this.#upgradeRegistered) return;
        this.#upgradeRegistered = true;
        this.#server.handleUpgrade(request, socket, head, ((ws) => {
            this.#server.emit('connection', ws, request);
            ws.on('message', this._onReceivedMessage.bind(this, ws));
            ws.on('close', this._onClose.bind(this, ws));
        }).bind(this));
    }

    /**
     *  Event which will be triggered when a client is successfully connected
     * @param {webSocket} socket
     */
    _onClientConnected(socket) {
        this._triggerEvent('connection', undefined, socket);
    }

    /**
     * Sends a message to a specific connected client
     * @param {string} topic topic on which the message will be send
     * @param {any but not string} message message to be send
     * @param {webSocket} webSocket if is ws instance of 'ws' the message will be sent using the specified webSocket, if is not ws instance of 'ws' the message will be broadcasted
     */
    send(topic, message, webSocket) {
        if (typeof (topic) !== 'string') { throw new Error('Invalid topic on send command'); }
        if (typeof (webSocket) === 'undefined' ) { //TODO check if webSocket is a webSocket
            this.broadcast(topic, message);
        } else {
            webSocket.send(this._encodedMessage(topic, message));
        }
    };

    /**
     * Sends a message by broadcasting to all connected clients
     * @param {string} topic topic on which the message will be send
     * @param {any but not string} message message to be send
     */
    broadcast(topic, message) {
        var msg = this._encodedMessage(topic, message);
        this.#server.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(msg);
            }
        });
    }

    _onClose() {
        // debugger;
    }

    _onReceivedMessage(socket, message) {
        var msg = this._decodeMessage(message);
        this._triggerEvent(msg.topic, msg.payload, socket);
    }

    /**
     * Encodes a message before sending it via WebSocket
     * @param {string} topic topic used to send the info
     * @param {any but function} message body information
     */
    _encodedMessage(topic, message) {
        if (typeof (topic) !== 'string' || (typeof (message) === 'undefined' || typeof (message) === 'function')) {
            throw Error('Invalid arguments [topic:string, message:!(undefined|function)]');
        }
        return JSON.stringify({ topic: topic, payload: message });
    }

    /**
     * Decodes an incoming message;
     * @param {string} message payload
     */
    _decodeMessage(message) {
        if (typeof (message) !== 'string') {
            throw Error('Invalid message!!!');
        }
        var msg = undefined;
        try {
            msg = JSON.parse(message);
        } catch (error) {
            error.message = 'Could not decode message: ' + error.message;
            throw error;
        }
        if (typeof (msg) !== 'object' || typeof (msg.topic) !== 'string') {
            //TODO throw error???
            throw Error('Invalid message!!!');
        }
        return msg;
    }
}
module.exports = WebSocketServer;