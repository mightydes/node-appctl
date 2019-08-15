const _ = require('underscore');
const net = require('net');
const debug = require('debug')('node-appctl:client');

class AppctlClient {

    /**
     * @param options
     * @options {string} 'socketPath' -- mandatory
     * @options {int} 'socketTtl' -- optional
     */
    constructor(options) {
        this.options = _.extend({
            socketTtl: 1000
        }, options);
    }

    /**
     * @param {string} command
     * @param {object|null} data
     * @returns {Promise<any>}
     */
    emit(command, data = {}) {
        let result = null;
        return new Promise((resolve, reject) => {
            const message = JSON.stringify({command: command, data: data});
            const ttl = this.options.socketTtl;

            const socket = new net.Socket();
            socket.setTimeout(ttl);

            // On connect:
            socket.on('connect', () => socket.write(message));

            // On response received:
            socket.on('data', (data) => {
                try {
                    result = JSON.parse(data.toString().trim());
                } catch (e) {
                }
                socket.end();
            });

            // On timeout:
            socket.on('timeout', () => reject(new Error('[node-appctl] Command socket timed out!')));

            // On error:
            socket.on('error', (e) => reject(e));

            // On exit:
            socket.on('close', () => resolve(result));

            socket.connect(this.options.socketPath);
        });
    }

}

module.exports = AppctlClient;
