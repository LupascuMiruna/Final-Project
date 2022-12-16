const _ = require("lodash");
const vscode = require('vscode');
const wordsToNumbers = require("words-to-numbers");

const commands = require("./commands.json");
const languages = require("./languages.json");
const HtmlExecutor = require('./executors/htmlExecutor');
const PythonExecutor = require('./executors/pythonExecutor');
const executor = require('./executors/executor');

// TODO: replace with Lodash function
const isDict = (dict) => {
    return typeof dict === "object" && !Array.isArray(dict);
};

class Dispatcher {
    constructor(executors) {
        this.executors = executors;
        this.languages = languages;

        this.initCommands();
    }

    initCommands() {
        // TODO
        this.commands = commands;
    }

    _getCurrentExecutor() {
        const currentLanguage = vscode.window.activeTextEditor.document.languageId;
        return this.executors[currentLanguage];
    }

    searchLanguage(words) {
        var commandToLook = this.commands;
        var languagesToLook = this.languages;
        var index = 0;
        if (commandToLook[words[index]]) {
            //command
            var commandFound = false;
            while (commandFound == false) {
                if (commandToLook[words[index]]) {
                    commandToLook = commandToLook[words[index]];
                    index += 1;
                    if (!isDict(commandToLook)) {
                        commandFound = true;
                        this.executor[commandToLook](words.slice(index));
                    }
                } else {
                    console.log("Command not found");
                    break;
                }
            }
        } else if (languagesToLook[words[index]]) {
            //create python file
            const languageExtension = languagesToLook[words[index]][0]; /// for moment choose the first choice
            this.executor.createFile(words.slice(2), languageExtension);
        } else {
            console.log("Command not found");
        }
    }

    dispatch(alternatives) {
        for (const alternative of alternatives) {
            const words = alternative.split(" ").map((word) => _.toLower(word));
            var index = 0;

            if (words[index] == "create") {
                this.searchLanguage(words.slice(1));
            } else {
                let path = "";
                for (const [index, word] of words.entries()) {
                    path = index === 0 ? word : `${path}.${word}`;
                    const resultAtPath = _.get(this.commands, path);

                    if (!resultAtPath) {
                        console.log("Command not found");
                        break;
                    }

                    if (!_.isString(resultAtPath)) {
                        continue;
                    }

                    let currentExecutor = this._getCurrentExecutor();
                    // Daca nu exista metoda pe executorul curent, fallback catre SystemExecutor
                    if (!currentExecutor[resultAtPath]) {
                        currentExecutor = this.executors.system;
                    }

                    // Daca metoda nu exista nici pe System executor, atunci consideram ca nu exista
                    if (!currentExecutor[resultAtPath]) {
                        console.log("Command not found");
                        break;
                    }

                    currentExecutor[resultAtPath](words.slice(index + 1));
                    break;
                }
            }
        }
    }
}

module.exports = new Dispatcher({
    html: new HtmlExecutor(),
    python: new PythonExecutor(),
    system: executor,
});
