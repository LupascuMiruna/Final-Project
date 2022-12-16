const _ = require('lodash');
const vscode = require('vscode');
const wordsToNumbers = require('words-to-numbers');

const commands = require('./commands.json');
const languages = require('./languages.json');
const HtmlExecutor = require('./executors/htmlExecutor');
const PythonExecutor = require('./executors/pythonExecutor');
const SystemExecutor = require('./executors/systemExecutor');

class Dispatcher {
    constructor(executors) {
        this.executors = executors;
        this.languages = languages;

        this._initCommands();
    }

    _initCommands() {
        for (let language in this.languages) {
            commands['create'][language] = 'createFile';
        }
        this.commands = commands;
    }

    _getCurrentExecutor() {
        const currentLanguage = vscode.window.activeTextEditor.document.languageId;
        return this.executors[currentLanguage];
    }

    dispatch(alternatives) {
        for (const alternative of alternatives) {
            const words = alternative.split(' ').map((word) => _.toLower(word));
            var index = 0;

            let path = '';
            for (const [index, word] of words.entries()) {
                path = index === 0 ? word : `${path}.${word}`;
                const resultAtPath = _.get(this.commands, path);

                if (!resultAtPath) {
                    console.log('Command not found');
                    break;
                }

                if (!_.isString(resultAtPath)) {
                    continue;
                }

                let currentExecutor = this._getCurrentExecutor();
                // If there is not the method on the current executor, fallback to SystemExecutor
                if (!currentExecutor[resultAtPath]) {
                    currentExecutor = this.executors.system;
                }
                
                //If there is not on the System executor, too, cosider that it doesn't exist.
                if (!currentExecutor[resultAtPath]) {
                    console.log('Command not found');
                    break;
                }

                currentExecutor[resultAtPath](words.slice(index + 1));
                break;
            }
        }
    }
}


module.exports = new Dispatcher({
    html: new HtmlExecutor(),
    python: new PythonExecutor(),
    system: new SystemExecutor(),
});
