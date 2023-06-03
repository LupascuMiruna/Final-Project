const vscode = require('vscode');
const _ = require('lodash');
const Executor = require('./executor');

class LanguageExecutor extends Executor{
    constructor(){
        super();
    }

    async goToDefinition() {
        await this._executeCommand('editor.action.revealDefinition');
    }
    
    // true
    // string my string
    // my variable
    evaluateTypeParameter(argvs = []) {
        const evaluateMap = {
            number: (params) => {
                return params;
            },
            string: (params) => {
                return `'${params.join(' ')}'`;
            },
        };
        const booleanValues = ['true', 'false'];
        const lastArgument = argvs.at(-1);

        if (booleanValues.includes(lastArgument)) {
            return _.capitalize(lastArgument);
        }

        if (!evaluateMap[lastArgument]) {
            return _.snakeCase(argvs.join(' '));
        }

        argvs.pop();
        return evaluateMap[lastArgument](argvs);
    }

    // index separator delimits the variable from its value
    // its value can be  true/ number 12/ string my value/ other_variable
    evaluateArguments(argvs, indexSeparator) { // separates de name of the parameter from the implicit value
        const parameterName = _.snakeCase(argvs.slice(0,indexSeparator).join(' '));
        let parameterValue = this.evaluateTypeParameter(argvs.slice(indexSeparator+1));
        let compiled = _.template('{{parameterName1}}={{parameterValue1}}');
        const text = compiled({ parameterName1: parameterName, parameterValue1: parameterValue });
        return text;  
    }
}

module.exports = LanguageExecutor;