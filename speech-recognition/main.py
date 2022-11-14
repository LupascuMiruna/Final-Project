import speech_recognition as sr

import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()

def speech_to_text():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        # read the audio data from the default microphone
        print("Start recording...")
        audio_data = r.record(source, duration=5)
        print("Recognizing...")
        # convert speech to text
        recognition_response = r.recognize_google(audio_data, language="en-US", show_all=True)
        recognition_response = list(map(lambda alternative : alternative['transcript'], recognition_response['alternative']))
        return recognition_response


if __name__ == '__main__':
    alternatives = speech_to_text()
    sio.connect('http://localhost:3000')
    sio.emit('onCommand', { 'alternatives': alternatives })
    sio.wait()
