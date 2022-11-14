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
        }
    }
}

module.exports = Dispatcher