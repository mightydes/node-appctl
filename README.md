# node-appctl
NodeJS IPC Tool

---

## Command Format

This package provides an IPC bridge via unix-socket.
Communication performed using JSON commands:

```json
{
  "command": "getSomeValue",
  "data": {}
}
```

Where `command` is the command name, and `data` is the command payload (optional).

---

## Server

```js
const appctl = require('node-appctl');

const server = appctl.createServer({
    socketPath: '/path/to/unix.sock' // Mandatory path to unix socket
});

server.register('exampleCommand', (data) => {
    // `data` -- is the optional command payload...
    // You can either return sync response, or Promise object.
    // The returned value should be JSON serializable.
});

// Now the server is listening for the `getSomeValue` command,
// and will send registered function response to the client.
```

---

## Client

```js
const appctl = require('node-appctl');

const client = appctl.createClient({
    socketPath: '/path/to/unix.sock' // Mandatory path to unix socket
});

client.emit('exampleCommand', {hello: 'World'})
    .then((res) => {
        // ...
    })
    .catch((err) => console.error(err));
```

---
