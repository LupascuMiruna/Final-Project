import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def onMessage(data):
    print('message received with ', data)

@sio.event
def disconnect():
    print('disconnected from server')

if __name__ == '__main__':
    sio.connect('http://localhost:3000')
    sio.wait()