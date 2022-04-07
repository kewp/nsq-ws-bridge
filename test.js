// run this test with node test.js
// should work right off the bat

function log() {
    var args = Array.from(arguments); // ES5
    args.unshift('[test.js]');
    console.log.apply(console, args);
}

const { get_server} = require('./scrap/ws-server-lib.js');

log('starting server');

let ws = get_server();

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


