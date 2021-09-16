const WebSocket = require('ws');


const wss = new WebSocket.WebSocketServer({ port: 8080 });
const nsq = require('nsqjs')

let readers = {}

const timer = ms => new Promise( res => setTimeout(res, ms));

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    
    console.log('message',message);
    console.log('typeof',typeof(message));
    if (typeof(message)==='object')
    {
        console.log('got object')
        let obj;
        try {
            obj = JSON.parse(message);
            if (obj['type'] && obj['type']=='handshake')
            {
                let { topic, channel } = obj;
                console.log('received handshake for topic '+topic+' and channel '+channel);
                const reader = new nsq.Reader(topic, channel, {
                    lookupdHTTPAddresses: '127.0.0.1:4161'
                })

                readers[ws] = reader;

                reader.connect()

                reader.on('message', msg => {
                    console.log('Received message [%s]: %s', msg.id, msg.body.toString())
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(msg.body.toString());
                        }
                      });
                    //ws.send(msg.body.toString());
                    msg.finish();
                    //timer(100).then(_=>msg.finish());
                    //ws.send(msg);
                    //msg.finish()
                })

            }
            else
            {
                console.log('got strange object',obj)
            }
        }
        catch (e) {
            console.log('could not parse object');
            
        }
        
    }
    else console.log('received: %s', message);
  });

  ws.send('sent from server (on first connection)');
});