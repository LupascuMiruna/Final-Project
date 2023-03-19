import azure.cognitiveservices.speech as speechsdk

speech_config = speechsdk.SpeechConfig(subscription="2aa80346d4d641468b7cc791e7998422", region="westeurope")
speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config)

def get_text():
    print("Speak into your microphone.")
    result = speech_recognizer.recognize_once_async().get()
    print('Finished')
    return result.text