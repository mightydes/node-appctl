const fs = require('fs');
const net = require('net');
const _ = require('underscore');
const debug = require('debug')('node-appctl:server');

class AppctlServer {

    /**
     * @param options
     * @options {string} 'socketPath' -- mandatory
     */
    constructor(options) {
        this.options = options;
        this.server = net.createServer();
        this.server.listen(this.prepSocket());
        this.server.on('connection', (emitter) => {
            emitter.on('data', (data) => {
                try {
                    const action = JSON.parse(data.toString());
                    if (!_.has(action, 'command') || !_.has(action, 'data')) {
                        throw new Error(`[node-appctl] Bad action format!`);
                    }
                    this.handleCommand(action.command, action.data, emitter);
                } catch (e) {
                    console.error(e);
                    return emitter.end();
                }
            });
        });
        this._register = {};
    }

    /**
     * @public
     * @param {string} command
     * @param {function} handler
     */
    register(command, handler) {
        this._register[command] = handler;
    }

    /**
     * @private
     * @returns {string}
     */
    prepSocket() {
        try {
            fs.unlinkSync(this.options.socketPath);
        } catch (e) {
        }
        return this.options.socketPath;
    }

    /**
     * @private
     * @param {string} command
     * @param {object} data
     * @param {object} emitter
     * @returns {*}
     */
    handleCommand(command, data, emitter) {
        try {
            if (!_.has(this._register, command)) {
                throw new Error(`[node-appctl] Unknown command: '${command}'!`);
            }
            const res = this._register[command](data);
            if (res instanceof Promise) {
                return res.then((response) => this.sendResponse(response, emitter));
            }
            return this.sendResponse(res, emitter);
        } catch (e) {
            console.error(e);
            return emitter.end();
        }
    }

    /**
     * @param {*} response
     * @param {object} emitter
     * @returns {*}
     */
    sendResponse(response, emitter) {
        return emitter.end(JSON.stringify(response));
    }

}

module.exports = AppctlServer;
