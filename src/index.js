const debug = require('debug')('node-appctl');
const AppctlServer = require('./server');
const AppctlClient = require('./client');

module.exports = {
    createServer,
    createClient
};


// FUNCTIONS:

function createServer(options) {
    return new AppctlServer(options)
}

function createClient(options) {
    return new AppctlClient(options)
}
