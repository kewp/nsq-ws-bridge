const chokidar = require('chokidar');
const nsq = require('nsqjs')

function log() {
  var args = Array.from(arguments); // ES5
    args.unshift('[chokidar-server]');
    console.log.apply(console, args);
}

function setup(w) {

  w.connect();
  w.on('ready', () => {
    log('writer ready');

    // One-liner for current directory
    chokidar.watch('*.js').on('all', (event, path) => {
      log(event, path);
      w.publish('fs', 'event on ' + path);
    });
  })

  w.on('error', (e) => { log('writer error',e); })
  w.on('close', () => { log('writer closed') })
}

module.exports = {
  watch: function() {

    log('starting chokidar watch');

    const host = '127.0.0.1', port = 4150;
    
    try {
      const w = new nsq.Writer(host, port);
      setup(w);
    }
    catch (e) { log('exception',e); }

  }
}