let express = require('express')
let amqplib = require('amqplib')
let app = express()
let server = require('http').createServer(app)
let io = require('socket.io')(server)

app.use(express.static('public'))
app.use(express.static('node_modules/leaflet/dist'))
app.use(express.static('node_modules/alertify.js/dist'))
app.use(express.static('node_modules/socket.io-client/dist'))

let open = amqplib.connect('amqp://localhost')

// Create the RabbitMQ Exchange, Queues and Bindings
open.then(function(conn) {
  return conn.createChannel()
}).then(function(ch) {
  return ch.assertExchange('geolocation-exchange', 'fanout').then(function(geolocationExchange) {
    ch.assertQueue('analytics-queue').then(function(analyticsQueue) {
      ch.bindQueue(analyticsQueue.queue, geolocationExchange.exchange)
    })
    ch.assertQueue('map-queue').then(function(mapQueue) {
      ch.bindQueue(mapQueue.queue, geolocationExchange.exchange)
    })
    ch.assertQueue('redis-queue').then(function(redisQueue) {
      ch.bindQueue(redisQueue.queue, geolocationExchange.exchange)
    })
  })
}).catch(console.warn)

io.sockets.on('connection', function (socket) {
  socket.on('send', function (data) {
    socket.broadcast.emit('send', data);
    // Send to data to RabbitMQ
    open.then(function(conn) {
      return conn.createChannel()
    }).then(function(ch) {
      return ch.assertExchange('geolocation-exchange', 'fanout').then(function(geolocationExchange) {
        ch.publish(geolocationExchange.exchange, '', Buffer.from(JSON.stringify(data)))
      })
    }).catch(console.warn)
  })
  socket.on('receive', function (data) {
    socket.broadcast.emit('receive', data);
  })
})

server.listen(80, '127.0.0.1', function() {
  console.log('Mobility App running on Localhost')
})