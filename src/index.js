const debug = require('debug')('node-appctl');
const AppctlServer = require('./server');

let _server = null;

module.exports = {
    createServer,
    registerCommand
};


// FUNCTIONS:

function createServer(options) {
    _server = new AppctlServer(options)
}

function registerCommand(name, fn) {
    if (!_server) {
        return console.error(`[node-appctl] Server is not created!`);
    }
    _server.register(name, fn);
}
