import speech_recognition as sr

import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def my_message(data):
    print('message received with ', data)
    sio.emit('my response', {'response': 'my response'})

@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()

@sio.event
def hello(arg):
    print(arg)

def speech_to_text():

    filename = "machine-learning_speech-recognition.wav"

    # initialize the recognizer
    r = sr.Recognizer()
    # open the file
    with sr.AudioFile(filename) as source:
        # listen for the data (load audio to memory)
        audio_data = r.record(source)
        # recognize (convert from speech to text)
        text = r.recognize_google(audio_data)
        return text

if __name__ == '__main__':
    text = speech_to_text()
    sio.connect('http://localhost:3000')
    sio.emit('onCommand', { 'text': text})
    sio.wait()