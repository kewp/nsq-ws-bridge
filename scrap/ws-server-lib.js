
const nsq = require('nsqjs')
const WebSocket = require('ws');

function log() {
    var args = Array.from(arguments); // ES5
    args.unshift('[ws-server-lib]');
    console.log.apply(console, args);
}

let readers = {}

function handle_obj(obj, ws, wss) {
    if (obj['type'] && obj['type']=='handshake')
    {
        let { topic, channel } = obj;
        
        let url = '127.0.0.1:4161';

        log(' - received handshake for topic '+topic+' and channel '+channel);
        log(' - creating nsq reader on', url);

        const reader = new nsq.Reader(topic, channel, { lookupdHTTPAddresses: url })

        readers[ws] = reader;

        reader.connect()

        reader.on('message', msg => {
            log('[nsq reader]: Received message [%s] on topic [%s]: %s', msg.id, topic, msg.body.toString())
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

        reader.on('error', error => {
            log('[nsq reader]: error',error);
        })

    }
    else
    {
        log(' - got strange object',obj)
    }
}

function start_bridge_server() {

    const wss = new WebSocket.WebSocketServer({ port: 8080 });

    // const timer = ms => new Promise( res => setTimeout(res, ms));

    wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        
        log('on message (type',typeof(message)+')');
        //console.log('ws-server-lib ws.on message typeof:',typeof(message));
        if (typeof(message)==='object')
        {
            log(' - trying to parse object (',message.toString(),')');
            
            let obj;
            try { obj = JSON.parse(message);  }
            catch (e) { log(' - could not parse object'); }

            if (obj) {
                log(' - trying to handle object');
                try { handle_obj(obj, ws, wss); }
                catch (e) { log(' - could not handle object:',e); }
            }
        }
        else log(' - unknown message type: %s', message);
    });

    let msg = 'sent from server (on first connection)';
    log('ws.send',msg)
    ws.send(msg);
    });

}
module.exports = { start_bridge_server }