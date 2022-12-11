const commands = require('./commands.json');
const _ = require('lodash');

const isDict = dict => {
    return typeof dict === "object" && !Array.isArray(dict);
  };

class Dispatcher {
    constructor(executor) {
        this.executor = executor;
        this.commands = commands;
    }

    dispatch(alternatives) {
        for(const alternative of alternatives) {
            const words = alternative.split(' ');
            var index = 0;
            var commandFound = false;
            var commandToLook = this.commands
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