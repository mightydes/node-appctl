process.env.DEBUG = 'node-appctl*';

const appctl = require('../src');

const server = appctl.createServer({
    path: `${__dirname}/test.sock`
});

server.register('hello', (data) => {
    console.log(`Received 'hello' from a client!`, data);
    return `Hello Client!`;
});
