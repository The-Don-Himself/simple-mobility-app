let amqplib = require('amqplib')
let queue = 'redis-queue'
let open = amqplib.connect('amqp://localhost')
// Key-Value Store Consumer
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(queue).then(function(ok) {
    return ch.consume(queue, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        // To Do - Persist new Geolocation Key-Value store like Redis
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);