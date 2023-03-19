const fs = require('fs');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const speechConfig = sdk.SpeechConfig.fromSubscription('2aa80346d4d641468b7cc791e7998422', "westeurope");

let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("machine-learning_speech-recognition.wav"));
let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

speechRecognizer.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
};

speechRecognizer.recognized = (s, e) => {
    if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
    }
    else if (e.result.reason == sdk.ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
    }
};

speechRecognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason == sdk.CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
        console.log("CANCELED: Did you set the speech resource key and region values?");
    }

    speechRecognizer.stopContinuousRecognitionAsync();
};

speechRecognizer.sessionStopped = (s, e) => {
    console.log("\n    Session stopped event.");
    speechRecognizer.stopContinuousRecognitionAsync();
};

speechRecognizer.startContinuousRecognitionAsync();