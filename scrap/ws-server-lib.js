
function log() {
    var args = Array.from(arguments); // ES5
    args.unshift('[ws-server-lib]');
    console.log.apply(console, args);
}

function get_server() {

    const WebSocket = require('ws');
    const wss = new WebSocket.WebSocketServer({ port: 8080 });
    const nsq = require('nsqjs')

    let readers = {}

    const timer = ms => new Promise( res => setTimeout(res, ms));

    wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        
        log('on message (type',typeof(message)+')');
        //console.log('ws-server-lib ws.on message typeof:',typeof(message));
        if (typeof(message)==='object')
        {
            log('on message - trying to parse object (',message.toString(),')');
            
            let obj;
            try {
                obj = JSON.parse(message);
                
                if (obj['type'] && obj['type']=='handshake')
                {
                    let { topic, channel } = obj;
                    console.log('ws-server-lib ws.on message (received handshake for topic '+topic+' and channel '+channel+')');
                    const reader = new nsq.Reader(topic, channel, {
                        lookupdHTTPAddresses: '127.0.0.1:4161'
                    })

                    readers[ws] = reader;

                    reader.connect()

                    
                    reader.on('message', msg => {
                        console.log('ws-server-lib [nsq reader on message]: Received message [%s] on topic [%s]: %s', msg.id, topic, msg.body.toString())
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

                    // reader.on('error', error => {
                    //     console.log('nsg error',error);
                    // })

                }
                else
                {
                    console.log('ws-server-lib on message: got strange object',obj)
                }
            }
            catch (e) {
                console.log('ws-server-lib on message exception: could not parse object:',e);
                
            }
            
        }
        else console.log('ws-server-lib unknown message type received: %s', message);
    });

    ws.send('sent from server (on first connection)');
    });

}
module.exports = { get_server }