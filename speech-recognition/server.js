const server = require('http').createServer();
const io = require('socket.io')(server);

function onCommandHandler (data) {
    io.emit('onMessage', data);
}

function onDisconnectHandler () {
    console.log('Disconnected');
}

io.on('connection', client => {
  client.on('onCommand', onCommandHandler);
  client.on('disconnect', onDisconnectHandler);
});

server.listen(3000);