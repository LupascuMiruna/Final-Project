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

# toDo verify microphone !!
def speech_to_text():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        while(True):
            # read the audio data from the default microphone
            print("Start recording...")

            r.adjust_for_ambient_noise(source)
            audio_data = r.listen(source) #snowboy, timeout
            

            # audio_data = r.record(source, duration=5)
            print("Recognizing...")
            # convert speech to text
            recognition_response = r.recognize_google(audio_data, language="en-US", show_all=True)
            print(recognition_response)
            recognition_response = list(map(lambda alternative : alternative['transcript'], recognition_response['alternative']))
            
        return recognition_response


if __name__ == '__main__':
    alternatives = speech_to_text()
    print(alternatives)
    # sio.connect('http://localhost:3000')
    # sio.emit('onCommand', { 'alternatives': alternatives })
    # sio.wait()
