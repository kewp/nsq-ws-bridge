# nsq-web

## background

currently there is no way to connect with [nsq](https://nsq.io)
via the browser. (see the next section on why this is).
this repo is an attempt to make that possible.

## client and server

one needs to understand how nsq works before one understand why
this library is structured as it is...

> i'm just learning about all of this so bear with me

nsq is a _server_ which you connect
to using various _clients_. so to use nsq from the browser
we have to figure out how to connect to the nsq server from
the browser.

_however_, nsq uses http for connections and browsers
don't have access to http.

> this is worth discussing more for beginners like me.
> for example, `xmlhttprequest` is not the same thing as `http`...

we can implement a "transport" using web sockets or server sent
events... but that means we have to have our own custom server
which handles these requests and passes themon to the `nsq` server.

SO this library is not just a client javascript library that
you insert into your `index.html` and pass the nsq server address.
no - it's a javascript client library _and_ a server - a server which
you have to run next to your nsq server. so i guess it's like a
nsq-websocket proxy server ...

## starting with websocket

we are essentially creating a new nsq client so we need to follow
the notes they made about this [here](https://nsq.io/clients/building_client_libraries.html).

to start, though, i want to use the popular [ws](https://github.com/websockets/ws)
library - it lets you create a websocket server and connect to
a websocket server all through node.

this will be a good test for the server and client - i can do
both on the server side and set things up (with pm2 i think)
that automatically re-runs tests

 - create `nsqd` instance
 - create `nsqjs` client (well supported node nsq library)
 - create websocket nsq server
 - create websocket nsq client

in fact, the `websocket nsq server` will have `nsqjs` inside of
it...

> perhaps it should be called `nsq-websocket-bridge` ....
> but then we would need `nsq-websocket`... hmmm.

> no let's call this `nsq-websocket-server` and
> `nsq-websocket-client`.

it's important to note that our `client` is not an
nsq client as they define it ... it's the code you
need to connect to the bridge ... even though it
does act like a client ... because nsq clients must
obey certain behaviours ...
