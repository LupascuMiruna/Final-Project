// const server = require('http').createServer();
// const io = require('socket.io')(server);

// function onCommandHandler (data) {
//     io.emit('onMessage', data);
// }

// function onDisconnectHandler () {
//     console.log('Disconnected');
// }

// io.on('connection', ws => {
//   ws.on('onCommand', onCommandHandler);
//   ws.on("onParse",onParseHandler);
//   ws.on('disconnect', onDisconnectHandler);
// });


// function onParseHandler(data){
//   //procesam 
//   //si trimitem inapoi 
//   io.emit('onParsed')
// }


// // trimite clientul inapoi: socket.emit(onTransmit, data);
// // primeste serverul inapoi: io.on(onTransmit, onTransmitHandler);
//       //trimite si inapoi io.emit('onReceive', data)
// // primeste inapoi clientul socket.on('onReceive', function(data){})


// server.listen(3000);