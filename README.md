# nsq websocket bridge nodejs

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
