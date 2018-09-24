let amqplib = require('amqplib')
let queue = 'analytics-queue'
let open = amqplib.connect('amqp://localhost')
// Log & Analytics Consumer
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(queue).then(function(ok) {
    return ch.consume(queue, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        // To Do - Persist new Geolocation coordinates in Analytics store like Elasticsearch
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);