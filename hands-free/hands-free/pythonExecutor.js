const _ = require('lodash');
const vscode = require('vscode');

class PythonExecutor {
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
}

module.exports = PythonExecutor;