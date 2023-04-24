const _ = require('lodash');
const vscode = require('vscode');
const wordsToNumbers = require('words-to-numbers');

const commands = require('./commands.json');
const languages = require('./languages.json');
const HtmlExecutor = require('./executors/htmlExecutor');
const PythonExecutor = require('./executors/pythonExecutor');
const SystemWrapper = require('./executors/systemWrapper');

class Dispatcher {
    constructor(executors) {
        this.executors = executors;
        this.languages = languages;

        // this._initCommands();
    }

    // hard to pass argvs because already parsed

    // _initCommands() {
    //     for (let language in this.languages) {
    //         commands['create'][language] = 'createFile';
    //     }
    //     this.commands = commands;
    // }

    _getCurrentExecutor() {
        const currentLanguage = vscode.window.activeTextEditor.document.languageId;
        return this.executors[currentLanguage];
    }

    dispatch(alternatives, method, argvs) {
        let currentExecutor = this._getCurrentExecutor();

        if(method) {
            if (!currentExecutor[method]) {
                currentExecutor = this.executors.system;
            }
            
            // If there is not on the System executor, too, cosider that it doesn't exist.
            if (!currentExecutor[method]) {
                console.log('Command not found');
            }
            else {
                currentExecutor[method]("", argvs);
            }
        }
        else {
            for (const alternative of alternatives) {
                const words = alternative.split(' ').map((word) => {
                    const cleanedWord = word.replace(/[^\w\s.+\-/%]/g, '');
                    return _.toLower(cleanedWord);
                });
                var index = 0;

                let path = '';
                for (let [index, word] of words.entries()) {
                    path = index === 0 ? word : `${path}.${word}`;
                    const resultAtPath = _.get(this.commands, path);

                    if (!resultAtPath) {
                        console.log('Command not found');
                        break;
                    }

                    if (!_.isString(resultAtPath)) {
                        continue;
                    }

                    // If there is not the method on the current executor, fallback to SystemExecutor
                    if (!currentExecutor[resultAtPath]) {
                        currentExecutor = this.executors.system;
                    }
                    
                    // If there is not on the System executor, too, cosider that it doesn't exist.
                    if (!currentExecutor[resultAtPath]) {
                        console.log('Command not found');
                        break;
                    }

                    if(words[index] == 'else' || words[index] == 'if') {
                        index--;
                    }
                    if(words[index-1] == 'else') {
                        index--;
                    }
                    currentExecutor[resultAtPath](words.slice(index + 1), []);
                    break;
                }
            }
        }
    }
}


module.exports = new Dispatcher({
    html: new HtmlExecutor(),
    python: new PythonExecutor(),
    system: new SystemWrapper(),
});
