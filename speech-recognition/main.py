import azure.cognitiveservices.speech as speechsdk
import socketio
import os

sio = socketio.Client()
subscription = os.environ.get('AZURE_API')
speech_config = speechsdk.SpeechConfig(subscription=subscription, region="westeurope")
speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)

@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')
    sio.disconnect()

class Listener:
    def __init__(self):
        self.sio = sio
        self.sio.connect('http://localhost:3001')

    def continue_listening(self, data):
        return not 'finish' in list(map(lambda sentence: sentence.lower(), data)) and self.should_continue

    # toDo verify microphone !!
    def speech_to_text(self):
        # read the audio data from the default microphone
        print("Start recording...")
        result = speech_recognizer.recognize_once_async().get()

        if result == '':
            return []
        return [result.text[:-1].lower()]

    def run_listener(self):
        alternatives = []
        self.should_continue = True

        while (self.continue_listening(alternatives)):

            alternatives = self.speech_to_text()
            if len(alternatives) > 0:
                print(alternatives)
                self.sio.emit('onCommand', {'alternatives': alternatives})
        # self.sio.wait()

    def stop_listener(self):
        self.should_continue = False
