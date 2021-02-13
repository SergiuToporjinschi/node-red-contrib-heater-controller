const path = 'heaterController/io/';
const ws = require('ws');
const _ = require('lodash');
var events = require('events');

class WebSocketServer {
    #socketURL = '';
    #server = undefined;
    #events = {};
    constructor(RED) {
        this.#server = new ws.Server({ noServer: true, clientTracking: true });
        this.#server.setMaxListeners(0);
        RED.server.on('upgrade', this._handleServerUpgrade.bind(this));
    }

    static createInstance(RED, id) {
        if (!this.wsw) {
            this.wsw = new WebSocketServer(RED);
            var base = RED.settings.httpNodeRoot.endsWith('/') ? RED.settings.httpNodeRoot : RED.settings.httpNodeRoot + '/';
            this.wsw.#socketURL = base + path + '${id}';
        }

        this.wsw.#events[id] = new events.EventEmitter();
        return this.wsw;
    }

    getURL(id) {
        return this.#socketURL.replace('${id}', id);
    }

    registerIncomingEvents(topic, func, id) {
        if (typeof (topic) !== 'string' || typeof (func) !== 'function' || typeof (id) !== 'string') {
            throw new Error("Invalid arguments [topic:string, func:function, id:string]");
        }
        this.#events[id].on(topic, func);
    }

    unRegister(id) {
        this.#events[id].removeAllListeners();
        this.#server.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.close(1000);
            } else {
                client.terminate();
            }
        });
    }

    _shouldIHandleThis(url) {
        if (typeof (url) !== 'string' || url.indexOf(path) < 0) return false;
        var urlId = url.substr(url.lastIndexOf('/') + 1);
        return _.keys(this.#events).includes(urlId);
    }

    _handleServerUpgrade(request, socket, head) {
        if (!this._shouldIHandleThis(request.url)) return;
        this.#server.handleUpgrade(request, socket, head, ((ws, message) => {
            var id = message.url.substr(message.url.lastIndexOf('/') + 1);
            try {
                this.#events[id].emit('connection', ws, id);
            } catch (error) {
                //TODO what to do with it???
            }
            ws.on('message', this._onReceivedMessage.bind(this, ws, this.#events[id]));
        }).bind(this));
    }


    /**
     * Sends a message to a specific connected client
     * @param {string} topic topic on which the message will be send
     * @param {any but not string} message message to be send
     * @param {webSocket} webSocket if is ws instance of 'ws' the message will be sent using the specified webSocket, if is not ws instance of 'ws' the message will be broadcasted
     */
    send(topic, message, webSocket) {
        if (typeof (topic) !== 'string') { throw new Error('Invalid topic on send command'); }
        if (typeof (webSocket) === 'undefined') { //TODO check if webSocket is a webSocket
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

    _onReceivedMessage(socket, event, message) {
        console.log('nr.Clients', this.#server.clients);
        event.emit(message.topic, message);
        // var msg = this._decodeMessage(message);
        // this._triggerEvent(msg.topic, msg.payload, socket);
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