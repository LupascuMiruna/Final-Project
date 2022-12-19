import socketio
import eventlet

sio = socketio.Server()
app = socketio.WSGIApp(sio)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.event
def connect(sid, environ, auth):
    print('connect')

@sio.on('onCommand')
def onCommandHandler(sid, data):
    print(data)
    sio.emit('onMessage', data)

@sio.on('onParse')
def onParseHandler(sid, data):
    return data


eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 3000)), app)
