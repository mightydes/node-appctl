# node-appctl
NodeJS IPC Tool

---

## Command Format

This package provides simple process intercommunication mechanism via TCP or IPC.
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

// For TCP connection:
const server = appctl.createServer({
    port: 4000,
    host: 'localhost'
});

// -OR- For IPC connection:
const server = appctl.createServer({
    path: '/path/to/appctl.sock'
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

// For TCP connection:
const client = appctl.createClient({
    port: 4000
});

// -OR- For IPC connection:
const client = appctl.createClient({
    path: '/path/to/appctl.sock'
});

client.emit('exampleCommand', {hello: 'World'})
    .then((res) => {
        // ...
    })
    .catch((err) => console.error(err));
```

---
