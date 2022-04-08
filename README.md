
## background

currently there is no way to connect with [nsq](https://nsq.io)
via the browser. this is because you cannot connect
to `nsqd` since browsers can't use http directly - you
have to use websockets for bidirectional communication.

this library provides a server using nodejs
that will pass messages on to nsq which are
being sent to it via websocket calls.

so here is how you might use this:

- launch nsdq
- launch nsq-ws-bridge-nodejs
- use `nsq-ws-client-js` in your browser

## websocket client

i'm going to implement a client called `nsq-ws-client-js`
which will connect to the bridge server and behave as
a normal nsq client.

it is possible, though, to connect to the server using
any language or system as long as it uses websockets
as a transport and follows the same protocol.

## protocol

websocket doesn't behave the same way as nsq, so we
have to define a standard way of interpreting websocket
messages as nsq ones.

## test

i have a test that does all of this at once:

 - 'launches' a front-end (reads an html file into jsdom)
 - starts nsqlookupd and nsqd
 - launches an nsq client (watches for file changes)

just run `node test.js` and it should all work.

this is what the output looks like currently:

```
% node test.js
[test.js] starting server
[test.js] reading scrap/ws-client.html
[test.js] loading into jsdom
[browser] nsq.connect
[browser] nsq.connect
[test.js] spawning nsqlookupd
[test.js] spawning nsqd
[test.js] waiting one second
[ws-server-lib] ws.send sent from server (on first connection)
[browser] ws.send first connect message
[browser] reader (fs) msg: sent from server (on first connection)
[ws-server-lib] on message (type object)
[ws-server-lib]  - trying to parse object ( {"type":"handshake","topic":"fs","channel":"browser_channel"} )
[ws-server-lib]  - trying to handle object
[ws-server-lib]  - received handshake for topic fs and channel browser_channel
[ws-server-lib]  - creating nsq reader on 127.0.0.1:4161
[ws-server-lib] on message (type object)
[ws-server-lib]  - trying to parse object ( first connect message )
[ws-server-lib]  - could not parse object
[ws-server-lib] ws.send sent from server (on first connection)
[browser] ws.send first connect message
[browser] reader (reader) msg: sent from server (on first connection)
[ws-server-lib] on message (type object)
[ws-server-lib]  - trying to parse object ( {"type":"handshake","topic":"browser_topic","channel":"browser_channel"} )
[ws-server-lib]  - trying to handle object
[ws-server-lib]  - received handshake for topic browser_topic and channel browser_channel
[ws-server-lib]  - creating nsq reader on 127.0.0.1:4161
[ws-server-lib] on message (type object)
[ws-server-lib]  - trying to parse object ( first connect message )
[ws-server-lib]  - could not parse object
[test.js] starting chokidar dir watch
[chokidar-server] starting chokidar watch
[chokidar-server] writer ready
[chokidar-server] add test.js
[ws-server-lib] [nsq reader]: Received message [%s] on topic [%s]: %s 1089ad5e6423f000 fs event on test.js
[browser] reader (fs) msg: event on test.js
[browser] reader (reader) msg: event on test.js
```

each line is reported from a different part:

- `[test.js]` is anything happening from the test.js file
- `[ws-server-lib]` is from the web socket / nsq bridge server
- `[browser]` is anything coming from the front-end
- `[chokidar-server']` comes from the file watching client

### huh?

looking at the logs is confusing.

so the whole point of this library is to allow the browser
to act as an nsq client. that's it. it can both produce
messages and receive them (called Reader and Writer in the
parlance ... i'm still getting use to the nsq landscape)
and then any other part of the pipeline can receive
them or produce messages that come through to the browser.

so, to re-iterate:

 - nsq itself has to be started (normally `nsqlookupd` and `nsqd`)
 - now any normal nsq reader/writer can communicate with it.
   here this is just `chokidar-server` which uses the `nsqjs`
   library (a standard library) to send messages onto the `fs`
   channel for any file changes (to `test.js`)

ok. that's just setting up nsq normally. but now in order
to have the browser be an nsq client (i think i might be
making up this nomenclature) we need two things:

 - the _bridge_ needs to be started (right now called `ws-server`)
 - the browser needs special javascript to talk to this client
   (not yet a separate library ...)

