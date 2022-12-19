import socketio
import eventlet

sio = socketio.Server()
app = socketio.WSGIApp(sio)
eventlet.wsgi.server(eventlet.listen(('', 3000)), app)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.event
def connect(sid, environ, auth):
    print('connect')


@sio.event
def onCommand(sid, data):
    app.emit('onMessage', data)
