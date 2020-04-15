process.env.DEBUG = 'node-appctl*';

const appctl = require('../src');

const server = appctl.createServer({
    port: 4000,
    host: 'localhost'
});

server.register('hello', (data) => {
    console.log(`Received 'hello' from a client!`, data);
    return `Hello Client!`;
});
