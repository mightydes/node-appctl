const net = require('net');
const debug = require('debug')('node-appctl:client');

class AppctlClient {

    /**
     * @param options
     * @option {number} 'port'
     * @option {string} 'path' -- mutually exclusive with 'port'
     */
    constructor(options) {
        this.options = options;
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

            const client = net.createConnection(this.options, () => {
                client.write(message)
            });

            // On response received:
            client.on('data', (data) => {
                try {
                    result = JSON.parse(data.toString().trim());
                } catch (e) {
                }
                client.end();
            });

            // On timeout:
            client.on('timeout', () => reject(new Error('[node-appctl] Command client timed out!')));

            // On error:
            client.on('error', (e) => reject(e));

            // On exit:
            client.on('close', () => resolve(result));
        });
    }

}

module.exports = AppctlClient;
