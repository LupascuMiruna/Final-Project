const commands = require('./commands.json');

class Dispatcher {
    constructor(executor) {
        this.executor = executor;
        this.commands = commands;
    }

    dispatch(alternatives) {
        for(const alternative of alternatives) {
            if (this.commands[alternative]) {
                const command = this.commands[alternative];
                this.executor[command]();
                break;
            }
            else{
                const words = alternative.split(' ');
                if (this.commands[words[0]]) {
                    const command = this.commands[words[0]];
                    words.shift();
                    this.executor[command](words);
                    break;
                }



            }
        }
    }
}

module.exports = Dispatcher