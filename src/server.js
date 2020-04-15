const fs = require('fs');
const net = require('net');
const path = require('path');
const _ = require('underscore');
const debug = require('debug')('node-appctl:server');

class AppctlServer {

    /**
     * @param options
     * @option {number} 'port'
     * @option {string} 'path' -- mutually exclusive with 'port'
     * @option {string} 'host' -- optional
     */
    constructor(options) {
        this.options = options;
        this.server = net.createServer();
        this.server.listen(this.prepNetwork());
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
        debug(`Registering command:`, command);
        this._register[command] = handler;
    }

    /**
     * @public
     * @param {string} folder
     */
    registerFolder(folder) {
        fs.readdirSync(folder)
            .map((file) => {
                const filePath = path.join(folder, file);
                if (fs.lstatSync(filePath).isFile()) {
                    const commandName = file.substr(0, file.lastIndexOf('.'));
                    debug(`Registering command:`, commandName, filePath);
                    this.register(commandName, require(filePath));
                }
            });
    }

    /**
     * @private
     * @return {*}
     */
    prepNetwork() {
        if (!this.options.port && this.options.path) {
            // IPC socket:
            try {
                fs.unlinkSync(this.options.path);
            } catch (e) {
            }
            return _.pick(this.options, ['path']);
        }

        // TCP port:
        return _.pick(this.options, ['port', 'host']);
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
                return res
                    .then((response) => this.sendResponse(response, emitter))
                    .catch((e) => {
                        console.error(e);
                        return emitter.end();
                    });
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
