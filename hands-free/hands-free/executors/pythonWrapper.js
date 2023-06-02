const PythonExecutor = require("./pythonExecutor");

class PythonWrapper extends PythonExecutor {
    constructor () {
        super();
    }

    useCLU(options) {
        return options.useCLU
    }
    
    getParams(options, paramName) {
        if(options[paramName]) {
            return options['paramName'].split(" ");
        }
        return ''
        
    }

    addComment(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)?  this.getParams(options, 'comment') : sentence;
        super.addComment(argvs)
    }

    goFunction(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? this.getParams(options, 'functionName') : sentence;
        super.goFunction(argvs)
    }

    addClass(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? this.getParams(options, 'className') : sentence;
        super.addClass(argvs)
    }

    addMethod(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? this.getParams(options, 'methodName') : sentence;
        super.addMethod(argvs)
    }


}

module.exports = PythonWrapper
