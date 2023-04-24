const SystemExecutor = require("./systemExecutor")

class SystemWraper extends SystemExecutor {
    constructor() {
        super()
    }

    async useIntents(sentence, options) {
        return sentence === '';
    }

    async gitCheckout(sentence, options) {
        let argvs;
        argvs = this.useIntents(sentence, options)? [options['branchName']] : sentence;
        super.gitCheckout(argvs)
    }

    async gitCommit(sentence, options) {
        let argvs;
        argvs = this.useIntents(sentence, options)? [options['commitMessage']] : sentence;
        super.gitCommit(argvs)
    }

    async openFile(sentence, options) {
        let argvs;
        argvs = this.useIntents(sentence, options)? [options['fileName']] : sentence;
        super.openFile(argvs)
    }

    async typeCommandTerminal(sentence, options) {
        let argvs;
        argvs = this.useIntents(sentence, options)? [options['command']] : sentence;
        super.typeCommandTerminal(argvs)
    }
}

module.exports = SystemWraper;