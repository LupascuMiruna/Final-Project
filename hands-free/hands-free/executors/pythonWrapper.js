const PythonExecutor = require("./pythonExecutor");

class PythonWrapper extends PythonExecutor {
    constructor () {
        super();
    }

    useCLU(options) {
        return options.useCLU
    }

    addComment(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['comment'].split(" ") : sentence;
        super.addComment(argvs)
    }

    goFunction(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['functionName'].split(" ") : sentence;
        super.goFunction(argvs)
    }

    addClass(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['className'].split(" ") : sentence;
        super.addClass(argvs)
    }

    addMethod(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? options['methodName'].split(" ") : sentence;
        super.addMethod(argvs)
    }


}

module.exports = PythonWrapper
