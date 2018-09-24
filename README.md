# simple-mobility-app

The repo is a very simple illustration of how to enhance a mobility application with a messaging queue specifically RabbitMQ.

## Requirements?

- [x] NodeJS
- [ ] Yarn | Optional
- [x] RabbitMQ
- [x] Socket.IO
- [x] Modern Browser preferably Chromium based (Chrome/Opera)

## How to Use?

1.) Clone the repo.
2.) Install dependencies.
3.) Make Sure RabbitMQ is working
4.) Start Express Server and register RabbitMQ exchange and queues: node server.js
5.) Start separate consoles and start each RabbitMQ consumer: 
  - node consumers/analytics.js 
  - node consumers/map.js 
  - node consumers/redis.js 
6.) Open RabbitMQ browser management console http://localhost:1567
7.) Open browser http://localhost
8.) Monitor each consumer consoles

![Image](choose_id.png?raw=true "Choose Rider ID")

![Image](get_location.png?raw=true "Getting Current Location")

![Image](riders.png?raw=true "Showing Nearby Connected Riders")
