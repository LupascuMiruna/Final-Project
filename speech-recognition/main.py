import azure.cognitiveservices.speech as speechsdk
import socketio
import os
import threading

AZURE_SUBSCRIPTION_KEY = os.environ.get('AZURE_API')
AZURE_REGION = os.environ.get('AZURE_REGION') or 'westeurope'
WS_SERVER_ADDRESS = os.environ.get('WS_SERVER_ADDRESS') or 'http://localhost:3001'

sio = socketio.Client()

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
        self.sio.connect(WS_SERVER_ADDRESS)

        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SUBSCRIPTION_KEY, 
            region=AZURE_REGION
        )
        self.speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)
        self.runner_thread = None

    def continue_listening(self, data):
        return not 'finish' in list(map(lambda sentence: sentence.lower(), data)) and self.should_continue

    # toDo verify microphone !!
    def speech_to_text(self):
        # read the audio data from the default microphone
        print("Start recording...")
        result = self.speech_recognizer.recognize_once_async().get()

        return [result.text.strip('?!.,').lower()]

    def run_listener(self):
        alternatives = []

        self.should_continue = True

        while (self.continue_listening(alternatives)):
            alternatives = self.speech_to_text()
            if len(alternatives) > 0 and self.should_continue == True:
                self.sio.emit('onCommand', {'alternatives': alternatives})

        print('Stop listening...')

    def stop_listener(self):
        self.should_continue = False

    def run_threaded_listener(self):
        if self.runner_thread and self.runner_thread.is_alive():
            return
        
        self.runner_thread = threading.Thread(target=self.run_listener).start()

    def destroy(self):
        self.sio.disconnect()
        self.sio.wait()
