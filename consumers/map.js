let amqplib = require('amqplib')
let io = require('socket.io-client')
let socket = io.connect('http://127.0.0.1:80', { reconnect: true });

let queue = 'map-queue'
let open = amqplib.connect('amqp://localhost')

// Update Client Map Consumer
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(queue).then(function() {
    return ch.consume(queue, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        // Tell socket.io server to update clients with new geolocation details
        let data = msg.content.toString()
        socket.emit('receive', JSON.parse(data));
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);