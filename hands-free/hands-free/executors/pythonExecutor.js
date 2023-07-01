const _ = require('lodash');
const vscode = require('vscode');

const LanguageExecutor = require('./languageExecutor');

class PythonExecutor extends LanguageExecutor {
    constructor() {
        super();
        this.expressions = { 'equal': '=', 'equals': '=', 'not': '!', 'less': '<', 'greater': '>' };
    }

    addComment(argvs) {
        let content = argvs.join(' ');
        let compiled = _.template('# {{comment}}');
        const text = compiled({ comment: content });
        this.insertText(text);
    }

    goFunction(argvs) {
        const functionName = 'def ' + _.camelCase(argvs.join(' '));
        const editor = vscode.workspace.textDocuments[0];
        const allText = editor.getText();
        let matches = [...allText.matchAll(new RegExp(`${functionName}`, 'gm'))];

        let activeText = this._getTextEditor();

        matches.forEach((match, index) => {
            let startPosition = activeText.document.positionAt(match.index);
            let newSelection = new vscode.Selection(startPosition, startPosition);
            activeText.selection = newSelection;
        });
    }

    addClass(argvs) {
        if(argvs === ''){
            this.showErrorMesage(argvs.join(' '));
            return;
        }
        const className = _.capitalize(_.camelCase(argvs.join(' ')));
        let compiled = _.template('class {{className}}:');
        const text = compiled({ className: className });
        this.insertText(text);
        this.insertLine();
    }

    addMethod(argvs) {
        const methodName = _.camelCase(argvs.join(' '));
        let compiled = _.template('def {{methodName}}(self):');
        const text = compiled({ methodName: methodName });
        this.insertText(text);
        this.insertLine();
    }

    addParameter(argvs) {
        const regexForFunction = this.getRegexForFunction();
        const currentLine = this.getCursorPosition().line;

        const textCurrentLine = vscode.window.activeTextEditor.document.lineAt(currentLine).text;

        let matches = [...textCurrentLine.matchAll(regexForFunction)];
        let foundSelections = this.matchRegex(matches);
        let activeText = this._getTextEditor();

        if (foundSelections[0]) {
            this.moveCursorBeforeCharacter();  
            let parameterExists = false;

            const regexForExistingParameter = /\(.+?\)/g;
            let matches = [...textCurrentLine.matchAll(regexForExistingParameter)];
            let foundSelections = this.matchRegex(matches);
            if(foundSelections[0]){
                parameterExists = true;
            }

            const indexSeparator = argvs.indexOf('equals');
            let parameterName = _.snakeCase(argvs.join(' '));
            let text = parameterName;

            if (indexSeparator != -1) {
                text = this.evaluateArguments(argvs, indexSeparator)
            }
            if(parameterExists) {
                text = ', ' + text;
            }
            this.insertText(text)      
        }
    }
    
    // return true -->
    // return string my string --> "my string"
    // return number 12 --> 12
    // return my variable --> myVariable
    async addReturn(argvs) {
        const variableName = this.evaluateTypeParameter(argvs);
        let compiled = _.template('return {{variableName}} ');
        const text = compiled({ variableName: variableName });
        this.insertText(text);
    }

    async runActiveFile() {
        //await this._executeCommand('python.execSelectionInTerminal'); //for the selected code --> may add it later
        await this._executeCommand('python.execInTerminal');
    }

    getRegexForFunction() {
        return /def (\w+)\s*\((.*?)\):/g
    }

    async addVerificationCommand(argvs){
        let command = argvs[0];
        let indexToStart = 1;
        if(argvs[0] == 'else' && argvs[1] == 'if') {
            command = command + ' ' + argvs[1];
            indexToStart = 2;
        }   
        //argvs = argvs.slice(indexToStart)
        const expression = this.evaluateExpression(argvs.slice(indexToStart));
        let compiled = _.template('{{command}} {{expression}}: ');
        const text = compiled({ command: command, expression: expression});
        this.insertText(text);
        await this._executeCommand('cursorDown');
    }

    // i [not] equal/less/greater 0
    evaluateExpression(argvs) {  // i not equal zero --> i != 0
        let modifiedExpression = '';
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

    // transformed it because too complicated
    // async addFor(argvs){
    //     const indexIn = argvs.indexOf('in');
    //     const iteratorName = _.snakeCase(argvs.slice(0,indexIn).join(' '));
        
    //     const indexRange = argvs.indexOf('range');
    //     let objectToLook = null;
    //     let compiled = null;
    //     if(indexRange != -1) {//for i in range(n)
    //         objectToLook = _.snakeCase(argvs.slice(indexRange+1).join(' '));
    //         compiled = _.template('for {{iteratorName}} in range ({{objectToLook}}):');
    //     }
    //     else { //for elem in array
    //         objectToLook = _.snakeCase(argvs.slice(indexIn+1).join(' '));
    //         compiled = _.template('for {{iteratorName}} in {{objectToLook}}:');
    //     }
    //     const text = compiled({iteratorName: iteratorName, objectToLook: objectToLook});
    //     this.insertText(text);
    //     // await this._executeCommand('cursorDown');
    // }

        // loop data in data center
        // loop data in range data_center
    async loop(argvs){
        const indexIn = argvs.indexOf('in');
        const iteratorName = _.snakeCase(argvs.slice(0,indexIn).join(' '));
        
        const indexRange = argvs.indexOf('range');
        let objectToLook = null;
        let compiled = null;
        if(indexRange != -1) {//for i in range(n)
            objectToLook = _.snakeCase(argvs.slice(indexRange+1).join(' '));
            compiled = _.template('for {{iteratorName}} in range ({{objectToLook}}):');
        }
        else { //for elem in array
            objectToLook = _.snakeCase(argvs.slice(indexIn+1).join(' '));
            compiled = _.template('for {{iteratorName}} in {{objectToLook}}:');
        }
        const text = compiled({iteratorName: iteratorName, objectToLook: objectToLook});
        this.insertText(text);
    }

     // find & select
    //https://stackoverflow.com/questions/67934437/vscode-is-there-any-api-to-get-search-results
    //https://javascript.info/regexp-introduction
    async findSelectAll(argvs) { //if function --> camel case, if parameter --> snake case
        const editor = vscode.workspace.textDocuments[0];///de 0???????????????????????????????????????
        const allText = editor.getText();
        let objectToFind = argvs.slice(1).join(' ');

        if (argvs[0] === 'functions') {
            objectToFind = _.camelCase(objectToFind);
        }
        else if (argvs[0] === 'variables') {
            objectToFind = _.snakeCase(objectToFind);
        }
        else {
            this.showErrorMesage(argvs.join(' '));
        }

        let matches = [...allText.matchAll(new RegExp(`${objectToFind}`, 'gm'))];
        let foundSelections = this.matchRegex(matches)
        let activeText = this._getTextEditor();
        activeText.selection = foundSelections[0];
    }

    //asign x plus 2 to data
    async assignValue(argvs) { //leftSide = rightSide(leftTerm operation rightTerm)
        let indexTo;
        let currentOperation;
        const mathOperators = {
            "plus": "+",
            "minus": "-",
            "divide": "/",
            "modulo": "%"
          };

        const sentence = argvs.join(" ");
        const regex = new RegExp(Object.keys(mathOperators).join("|"), "gi");
        const result = sentence.replace(regex, match => mathOperators[match.toLowerCase()]);
        argvs = result.split(" ");

        if(argvs.includes("to")){
            indexTo = argvs.indexOf('to');
        }
        else {
            this.showErrorMesage(argvs.join(' '));
        }
        const leftSide = argvs.slice(indexTo + 1).join(' ');
        const rightSide = argvs.slice(0, indexTo).join(' ');
    
        const compiled = _.template('{{leftSide}} = {{rightSide}}');
        const text = compiled({ leftSide: leftSide, rightSide: rightSide});
        this.insertText(text);
    }

    addFunction(argvs) {
        const functionName = _.camelCase(argvs.join(' '));
        let compiled = _.template('def {{functionName}}():');
        const text = compiled({ functionName: functionName });
        this.insertText(text);
    }

    callFunction(argvs) {
        const functionName = _.camelCase(argvs.join(' '));
        let compiled = _.template('{{functionName}}()');
        const text = compiled({ functionName: functionName });
        this.insertText(text);
    }

    printData(argvs) // just for variables
    {
        const data = _.camelCase(argvs.join(' '));
        let compiled = _.template('print({{data}})');
        const text = compiled({ data: data });
        this.insertText(text);
    }
}

module.exports = PythonExecutor;