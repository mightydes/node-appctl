process.env.DEBUG = 'node-appctl*';

const appctl = require('../src');

const client = appctl.createClient({
    path: `${__dirname}/test.sock`
});

client.emit('hello', {msg: 'Hello Server!'})
    .then((res) => {
        console.log(`Received response from the server!`, res);
    })
    .catch((err) => console.error(err));
