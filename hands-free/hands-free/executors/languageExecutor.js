const vscode = require('vscode');

const Executor = require('./executor');

class LanguageExecutor extends Executor{
    constructor(){
        super();
    }

    async goToDefinition() {
        await this._executeCommand('editor.action.revealDefinition');
    }
    
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

    evaluateArguments(argvs, indexSeparator) { // separates de name of the parameter from the implicit value
        const parameterName = _.snakeCase(argvs.slice(0,indexSeparator).join(' '));
        let parameterValue = this.evaluateTypeParameter(argvs.slice(indexSeparator+1));
        let compiled = _.template('{{parameterName}}={{parameterValue}}');
        const text = compiled({ parameterName: parameterName, parameterValue: parameterValue });
        return text;  
    }
}

module.exports = LanguageExecutor;