const nsq = require('nsqjs')

const w = new nsq.Writer('127.0.0.1', 4150)

w.connect()

const topic = 'browser_topic';

w.on('ready', () => {
  w.publish(topic, 'it really tied the room together')
  w.deferPublish(topic, ['This message gonna arrive 1 sec later.'], 1000)
  w.publish(topic, [
    'Uh, excuse me. Mark it zero. Next frame.', 
    'Smokey, this is not \'Nam. This is bowling. There are rules.'
  ])
  w.publish(topic, 'Wu?',  err => {
    if (err) { return console.error(err.message) }
    console.log('Message sent successfully')
    w.close()
  })
})

w.on('closed', () => {
  console.log('Writer closed')
})