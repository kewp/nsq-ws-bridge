// run this test with node test.js
// should work right off the bat

function log() {
    var args = Array.from(arguments); // ES5
    args.unshift('[test.js]');
    console.log.apply(console, args);
}

const { start_bridge_server} = require('./scrap/ws-server-lib.js');

log('starting bridge server');

start_bridge_server();

// load ws-client.html

const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let path = 'scrap/ws-client.html';
log('reading',path);
let file = fs.readFileSync('scrap/ws-client.html').toString();

log('loading into jsdom');
const virtualConsole = new jsdom.VirtualConsole();
//virtualConsole.on("error", () => { console.log('error') });
virtualConsole.sendTo(console);

const dom = new JSDOM(file, { virtualConsole, runScripts: "dangerously" });

// nsqd
const { spawn } = require('child_process');

log('spawning nsqlookupd')
// nsqdLookupd Listens on 4161 for HTTP requests and 4160 for TCP requests
spawn('nsqlookupd');

log('spawning nsqd');
spawn('nsqd',['--lookupd-tcp-address=127.0.0.1:4160','--broadcast-address=127.0.0.1']);

log('waiting one second');

setTimeout( () => {
    // chokidar server

    log('starting chokidar dir watch');

    const { watch } = require('./scrap/chokidar-server.js');

    watch();
}, 1000);

