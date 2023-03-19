# Acest fisier contine logica server-ului de web sockets care actioneaza ca un Proxy intre clientul Speech-to-text si Extensia propriu-zisa

from saytex import Saytex
import socketio
import eventlet

sio = socketio.Server()
app = socketio.WSGIApp(sio)
saytex_compiler = Saytex()

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

@sio.event
def connect(sid, environ, auth):
    print('connect')

# Primeste comenzile de la clientul Speech-to-text si le transmite catre Extensie
@sio.on('onCommand')
def onCommandHandler(sid, data):
    print(data)
    sio.emit('onMessage', data)

@sio.on('onParse')
def onParseHandler(sid, data):
    # saytex.saytexsyntax.SaytexSyntax.is_valid_saytex_syntax
    return saytex_compiler.to_latex(data)

def start_server():
    eventlet.wsgi.server(eventlet.listen(('127.0.0.1', 3001)), app)