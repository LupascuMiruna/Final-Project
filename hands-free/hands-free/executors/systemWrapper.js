const SystemExecutor = require("./systemExecutor");

class SystemWraper extends SystemExecutor {
    constructor() {
        super();
    }

    useCLU(options) {
        return options.useCLU
    }

    async gitCheckout(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['branchName'].split(" ") : sentence;
        super.gitCheckout(argvs)
    }

    async gitCommit(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['commitMessage'].split(" ") : sentence;
        super.gitCommit(argvs)
    }

    async openFile(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['fileName'].split(" ") : sentence;
        super.openFile(argvs)
    }

    async typeCommandTerminal(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['command'].split(" ") : sentence;
        super.typeCommandTerminal(argvs)
    }
}

module.exports = SystemWraper;