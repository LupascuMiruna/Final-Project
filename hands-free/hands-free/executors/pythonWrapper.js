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
            return (options[paramName]).split(" ");
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

    addFunction(sentence, options) {
        let argvs;
        argvs = this.useCLU(options)? this.getParams(options, 'functionName') : sentence;
        super.addFunction(argvs)
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

    assignValue(sentence, options) {
        let argvs, leftSide, rightSide;
        if(this.useCLU(options)) {
            leftSide =  this.getParams(options, 'leftSide');
            rightSide =  this.getParams(options, 'rightSide')
            const compiled = _.template('{{leftSide}} = {{rightSide}}');
            const text = compiled({ leftSide: leftSide, rightSide: rightSide});
            this.insertText(text);
        }
        else {
            super.assignValue(sentence)
        }
    }


}

module.exports = PythonWrapper
