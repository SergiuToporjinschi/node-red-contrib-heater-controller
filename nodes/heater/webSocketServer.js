const path = require("path");
const url = require("url");
const ws = require('ws');
class WebSocketServer {
    #path = 'heaterController/io/';
    #socketURL = '';
    #server = undefined;
    constructor(RED, id) {
        var base = RED.settings.httpNodeRoot.endsWith('/') ? RED.settings.httpNodeRoot : RED.settings.httpNodeRoot + '/';
        this.#socketURL = base + this.#path + id;
        RED.server.on('upgrade', this._handleServerUpgrade.bind(this));
    }

    getURL() {
        return this.#socketURL;
    }

    _handleServerUpgrade(request, socket, head) {
        if (this.#socketURL !== request.url) return;
        this.#server.handleUpgrade(request, socket, head, ((ws) => {this.#server.clients
            ws.on('message', this._onReceivedMessage.bind(this, ws));
            this.#server.emit('connection', ws, request);
        }).bind(this));
    }

    _onClientConnected(socket, message) {

    }

    _onReceivedMessage(socket, message) {
        debugger;
        socket.send(["dt", "Response from server"] );
    }
    start() {
        // ws.Server()
        this.#server = new ws.Server({ noServer: true });
        this.#server.setMaxListeners(0);
        this.#server.on('connection', this._onClientConnected.bind(this));
    }


}
module.exports = WebSocketServer;