const SystemExecutor = require("./systemExecutor")

class SystemWraper extends SystemExecutor {
    constructor() {
        super()
    }

    async openFile(sentence, argvs) {
        if(sentence === '') {
            super.searchFile(argvs['fileName'])
        }
        else {
            super.openFile(sentence)
        }
    }
}

module.exports = SystemWraper;