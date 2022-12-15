const _ = require('lodash');
const { argv } = require('process');
const vscode = require('vscode');

class PythonExecutor {
    constructor() {
        this.expressions = { "equal": "=", "equals": "=", "not": "!", "lees": "<", "greater": ">" };
    }

    addComment(argvs) {
        let content = argvs.join(" ");
        let compiled = _.template('# {{comment}}');
        const text = compiled({ comment: content });
        return text;
    }

    goToFunction(argvs) {
        const functionName = "def " + _.camelCase(argvs.join(" "));
        return functionName;
    }

    addClass(argvs) {
        const className = _.capitalize(_.camelCase(argvs.join(" ")));
        let compiled = _.template('class {{className}}:');
        const text = compiled({ className: className });
        return text;
    }

    addMethod(argvs) {
        const methodName = _.camelCase(argvs.join(" "));
        let compiled = _.template('def {{methodName}}(self):');
        const text = compiled({ methodName: methodName });
        return text;
    }

    addParameter(argvs) {
        const parameterName = _.snakeCase(argvs.join(" "));
        return parameterName;
    }

    addReturn(variableName) {
        let compiled = _.template('return {{variableName}} ');
        const text = compiled({ variableName: variableName });
        return text;
    }

    async runActiveFile() {
        //await vscode.commands.executeCommand("python.execSelectionInTerminal"); //for the selected code --> may add it later
        await vscode.commands.executeCommand("python.execInTerminal");
    }

    getRegexForFunction() {
        return /def (\w+)\s*\((.*?)\):/g
    }

    addVerificationCommand(argvs){
        let command = argvs[0];
        let indexToStart = 1;
        if(argvs[0] == "else" && argvs[1] == "if") {
            command = command + " " + argvs[1];
            indexToStart = 2;
        }   
        //argvs = argvs.slice(indexToStart)
        const expression = this.evaluateExpression(argvs.slice(indexToStart));
        let compiled = _.template('{{command}} {{expression}}: ');
        const text = compiled({ command: command, expression: expression});
        return text;
    }

    evaluateExpression(argvs) {  // i not equal zero --> i != 0
        let modifiedExpression = "";
        for (let word of argvs) {
            if (this.expressions[word]) {
                modifiedExpression = modifiedExpression.concat(this.expressions[word]);
            }
            else {
                modifiedExpression = modifiedExpression.concat(word)
            }
        }
        return modifiedExpression;
    }

    addFor(argvs){
        const indexIn = argvs.indexOf("in");
        const iteratorName = _.snakeCase(argvs.slice(0,indexIn).join(" "));
        
        const indexRange = argvs.indexOf("range");
        let objectToLook = null;
        let compiled = null;
        if(indexRange != -1) {//for i in range(n)
            objectToLook = _.snakeCase(argvs.slice(indexRange+1).join(" "));
            compiled = _.template('for {{iteratorName}} in range ({{objectToLook}}):');
        }
        else { //for elem in array
            objectToLook = _.snakeCase(argvs.slice(indexIn+1).join(" "));
            compiled = _.template('for {{iteratorName}} in {{objectToLook}}:');
        }
        const text = compiled({iteratorName: iteratorName, objectToLook: objectToLook});
        return text;
    }
}

module.exports = PythonExecutor;