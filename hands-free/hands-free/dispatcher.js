const commands = require('./commands.json');
const languages = require('./languages.json');
const _ = require('lodash');

const isDict = dict => {
    return typeof dict === "object" && !Array.isArray(dict);
  };

class Dispatcher {
    constructor(executor) {
        this.executor = executor;
        this.commands = commands;
        this.languages = languages;
    }

    searchLanguage(words){
        var commandToLook = this.commands;
        var languagesToLook = this.languages;
        var index = 0;
        if(commandToLook[words[index]]) //command
        {
            var commandFound = false;
            while(commandFound == false) {
                if(commandToLook[words[index]]) {
                    commandToLook = commandToLook[words[index]];
                    index += 1;
                    if(! isDict(commandToLook)) {
                        commandFound = true;
                        this.executor[commandToLook](words.slice(index));
                    }
                }
                else {
                    console.log("Command not found")
                    break;
                } 
           }
        }
        else if(languagesToLook[words[index]]) //create python file
        {
            const languageExtension = languagesToLook[words[index]][0]; /// for moment choose the first choice
            this.executor.createFile(words.slice(2), languageExtension);
        }
        else{
            console.log("Command not found")
        }
    }

    dispatch(alternatives) {
        for(const alternative of alternatives) {
            const words = alternative.split(' ').map(word=>_.toLower(word));
            var index = 0;
            var commandFound = false;
            var commandToLook = this.commands
            if(words[index] == "create") {
                this.searchLanguage(words.slice(1))
            }
            else
                while(commandFound == false) {
                    if(commandToLook[words[index]]) {
                        commandToLook = commandToLook[words[index]];
                        index += 1;
                        if(! isDict(commandToLook)) {
                            commandFound = true;
                            this.executor[commandToLook](words.slice(index).map(word=>_.toLower(word)));
                        }
                    }
                    else {
                        console.log("Command not found")
                        break;
                    } 
                }
        }
           
    }
}
    

module.exports = Dispatcher