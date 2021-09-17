const chokidar = require('chokidar');
const nsq = require('nsqjs')

const w = new nsq.Writer('127.0.0.1', 4150)

w.connect()


// One-liner for current directory
chokidar.watch('.').on('all', (event, path) => {
  console.log(event, path);
  w.publish('fs', path)

});