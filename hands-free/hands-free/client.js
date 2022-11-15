//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});

class Client {
    constructor(dispatcher) {
        this.dispatcher = dispatcher
        data = "undo"
        dispatcher.dispatch(data)
        // // Add a connect listener
        // socket.on('connect', function () {
        //     console.log('Connected!');
        // });

        // socket.on('onMessage', function (data) {
		// 	dispatcher.dispatch(data.alternatives)
		// });
    }
}

module.exports = Client