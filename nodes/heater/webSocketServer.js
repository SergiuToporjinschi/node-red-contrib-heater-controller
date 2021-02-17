const path = 'heaterController/io/';
const ws = require('ws');
const _ = require('lodash');
var events = require('events');

class WebSocketServer {
    #socketURL = '';
    #server = undefined;
    #backEndClients = {};
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

        this.wsw.#backEndClients[id] = {
            events: new events.EventEmitter()
        };
        return this.wsw;
    }

    getURL(id) {
        return this.#socketURL.replace('${id}', id);
    }

    registerIncomingEvents(topic, func, id) {
        if (typeof (topic) !== 'string' || typeof (func) !== 'function' || typeof (id) !== 'string') {
            throw new Error('Invalid arguments [topic:string, func:function, id:string]');
        }
        this.#backEndClients[id].events.on(topic, func);
    }

    unRegister(id) {
        this.#backEndClients[id].events.removeAllListeners();
        this.#server.clients.forEach((client) => {
            if (client.clientId !== id) return;
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
        return _.keys(this.#backEndClients).includes(urlId);
    }

    _handleServerUpgrade(request, socket, head) {
        if (!this._shouldIHandleThis(request.url)) return;
        this.#server.handleUpgrade(request, socket, head, ((ws, message) => {
            var id = message.url.substr(message.url.lastIndexOf('/') + 1);
            try {
                ws.clientId = id;
                this.#backEndClients[id].ws = ws;
                this.#backEndClients[id].events.emit('connection', ws, id);
            } catch (error) {
                //TODO what to do with it???
            }
            ws.on('message', this._onReceivedMessage.bind(this, id));
        }).bind(this));
    }

    /**
     * Sends a message to a specific connected client
     * @param {string} id nodeId which sends the message
     * @param {string} topic  topic on which the message will be send
     * @param {any} message message to be send, can be any type but not function
     */
    send(id, topic, message) {
        if (typeof (topic) !== 'string' || typeof (id) === 'undefined') {
            throw new Error('Invalid id or topic');
        }
        var backEndClient = this.#backEndClients[id];
        if (typeof (backEndClient) === 'undefined') {
            throw new Error('Backend client not registered');
        }
        backEndClient.ws.send(this._encodedMessage(topic, message));
    }

    _onReceivedMessage(id, message) {
        var content = this._decodeMessage(message);
        this.#backEndClients[id].events.emit(content.topic, content);
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