const vscode = require('vscode');
const _ = require('lodash');

//const { moveCursor } = require('readline');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {
    
    constructor(){
        this.singleTags = ["area", "source", "br", "link", "input"];
        this.expressions = {"equal": "=", "equals": "=", "not": "!", "lees": "<", "greater": ">"}; //less or equal
    }

    //auxiliar methods
    async getCurrentEditor() {
        const editor = vscode.window.activeTextEditor;
		await vscode.window.showTextDocument(editor.document);
    }
 
    getCursorPosition() {
        let activeEditor = vscode.window.activeTextEditor;
        let cursorPosition = activeEditor.selection.active;

        return cursorPosition
    }

    insertText(cursorPosition, text) {
        let activeEditor = vscode.window.activeTextEditor;
        activeEditor.edit(editBuilder => {
            editBuilder.insert(cursorPosition, text)});
    }

    showErrorMesage() {
        vscode.window.showInformationMessage("Incorect format, please review the rules");
    }
    copyToClipboard() {
        vscode.commands.executeCommand("editor.action.clipboardCutAction");
    }


    // line l ==> at the beggining
    // column 0
    // right/left up/down --> one step
    moveCursor(argvs) { 
        const editor = vscode.window.activeTextEditor;
        const cursorPosition = this.getCursorPosition();

        var nextLine = cursorPosition.line;
        var nextColumn = cursorPosition.character;

        if(argvs[0] === "line") {
            if (isNaN(parseInt(argvs[1]))) {
                this.showErrorMesage();
                return;
            }
            nextLine = parseInt(argvs[1]);
            nextColumn = 0;
        }else if (argvs[0] === "column") {
            nextColumn = 0;
        } else if (argvs[0] === "right") {
            nextColumn += 1;
        } else if (argvs[0] === "left") {
           nextColumn = Math.max(nextColumn - 1, 0);
        } else if (argvs[0] === "up") {
            nextLine = Math.max(nextLine - 1, 0);
         } else if (argvs[0] === "down") {
            nextLine = nextLine + 1;
         } else {
            this.showErrorMesage();
            return;
         } 
        
        var newPosition = new vscode.Position(nextLine, nextColumn);
        var newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }

    selectBlock(argvs){ //from line ls to line lf
        const editor = vscode.window.activeTextEditor;
        const startLine = parseInt(argvs[2]);
        const stopLine = parseInt(argvs[5]);

        if(isNaN(startLine) || isNaN(stopLine)){
            this.showErrorMesage();
            return;
        }
        const startPosition = new vscode.Position(startLine - 1, 0);
        const stopPosition = new vscode.Position(stopLine, 0);
        var newSelection = new vscode.Selection(startPosition, stopPosition);
        editor.selection = newSelection;
     }



    // system function
    async undo() {
        this.getCurrentEditor();
		await vscode.commands.executeCommand("undo");
    }
    async save() {
        this.getCurrentEditor();
        await vscode.commands.executeCommand("workbench.action.files.save");
    }
    async closeTab() {
        this.getCurrentEditor();
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }
    async createTab() {  //set name????
        this.getCurrentEditor();
        await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
    }

    // inserting text
    async pasteFromClipboard(){
        var cursorPosition = this.getCursorPosition();
        var pastedContent = await vscode.env.clipboard.readText(); 
        this.insertText(cursorPosition, pastedContent);
    }

    async addCommentHTML(argvs) { // add comment this is a comment 
        var cursorPosition = this.getCursorPosition();
        var content = argvs.join(" ")
        var compiled = _.template('<!--{{comment}}-->');
        const text = compiled({comment: content})
        this.insertText(cursorPosition, text)
    }

    async addAttributeHTML(argvs) { //add attribute id equals login  !!!!trebuie sa vad unde il adaug pe linia curenta
        let cursorPosition = this.getCursorPosition();

        const attribute = argvs[0];
        const name = argvs.slice(2).join("-")

        var compiled = _.template(' {{attribute}}="{{name}}"');
        const text = compiled({ attribute: attribute, name: name});

        this.insertText(cursorPosition, text);
    }

    async openTag(argvs){ //open tag div
        let cursorPosition = this.getCursorPosition();
        let tag = argvs[0];
        var compiled = NaN;
        var isSingleTag = false;
        var compiled = _.template('<{{tag}}></{{tag}}>');

        if(this.singleTags.includes(tag)){
            var compiled = _.template('<{{tag}}>');
            isSingleTag = true;
        } 

        const text = compiled({ tag: tag });
        this.insertText(cursorPosition, text);
        if(isSingleTag) {
            return;
        }
        
        
        let lengthText = text.length;
        lengthText = (parseInt(lengthText/2))

        var p = new vscode.Position(0,lengthText);
        var s = new vscode.Selection(p, p);
        vscode.window.activeTextEditor.selection = s;
    }

    //Debugging
    startDebug() {
        vscode.commands.executeCommand("workbench.action.debug.start");
    }

    continueDebug() {
        vscode.commands.executeCommand("workbench.action.debug.continue");
    }

    stopDebug() {
        vscode.commands.executeCommand("workbench.action.debug.stop");
    }

    async inlineBreakpoint() {
        await vscode.commands.executeCommand("editor.debug.action.toggleInlineBreakpoint");
    }

    async showHoverDebug() { ////???????????????
        this.getCurrentEditor();
        vscode.commands.executeCommand("editor.debug.action.showDebugHover");
    }

    //Not done
    addFile() {
        console.log("addFile")
    }



    //Python
    async addClassPython(argvs) { // toDo go down and type pass
        var cursorPosition = this.getCursorPosition();
        const className = _.capitalize(_.camelCase(argvs.join(" ")));
        
        var compiled = _.template('class {{className}}:');
        const text = compiled({ className: className});

        this.insertText(cursorPosition, text);
    }

    async addMethodPython(argvs) {
        var cursorPosition = this.getCursorPosition();
        const methodName = _.camelCase(argvs.join(" "));

        var compiled =  _.template('def {{methodName}}(self):');
        const text = compiled({ methodName: methodName});

        this.insertText(cursorPosition, text);
    }
    matchRegex(matches) {
        var foundSelections = [];
        var activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            var startPosition = activeText.document.positionAt(match.index);
            var endPosition = activeText.document.positionAt(match.index + match[0].length);
            foundSelections[index] = new vscode.Selection(startPosition, endPosition);
        });
        return foundSelections;
    }

     // find & select
    //https://stackoverflow.com/questions/67934437/vscode-is-there-any-api-to-get-search-results
    //https://javascript.info/regexp-introduction
    async findSelectAllPython(argvs) { //if function --> camel case, if parameter --> snake case
        const editor = vscode.workspace.textDocuments[0];///de 0???????????????????????????????????????
        const allText = editor.getText();
        var objectToFind = argvs.slice(1).join(" ");

        if(argvs[0] === "functions"){
            objectToFind = _.camelCase(objectToFind);
        }
        else if(argvs[0] === "variables"){
            objectToFind = _.snakeCase(objectToFind);
        }
        else {
            this.showErrorMesage();
        }

        var matches = [...allText.matchAll(new RegExp(`${objectToFind}`, "gm"))];
        var foundSelections = this.matchRegex(matches)
        var activeText = vscode.window.activeTextEditor;
        activeText.selection = foundSelections[0];
    }

    // toDo: find regex for function name
    goToFunctionPython(argvs) {
        const functionName = "def " + _.camelCase(argvs.join(" "));
        const editor = vscode.workspace.textDocuments[0];
        const allText = editor.getText();
        var matches = [...allText.matchAll(new RegExp(`${functionName}`, "gm"))];

        var activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            var startPosition = activeText.document.positionAt(match.index);
            var newSelection = new vscode.Selection(startPosition, startPosition);
            activeText.selection = newSelection;
        });
    }

    //search in text some specific character --> !! at the moment after (
    moveCursorAfterCharacter() {
        const editor = vscode.workspace.textDocuments[0];
        const allText = editor.getText();
        const regexp = /(?<=\()/g; //for (
        var matches = [...allText.matchAll(regexp)];

        var activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            var startPosition = activeText.document.positionAt(match.index);
            var newSelection = new vscode.Selection(startPosition, startPosition);
            activeText.selection = newSelection;
        });

    }

    addParameterPython(argvs) {
        //we are already in the function header --> search parameters and insert on the first position
        const parameterName = _.snakeCase(argvs.join(" "));
        this.moveCursorAfterCharacter()
        var cursorPosition = this.getCursorPosition();
        this.insertText(cursorPosition, parameterName)
    }

    evaluateExpressionPython(currentExpression) {  // i not equal zero --> i != 0
        var modifiedExpression = "";
        for (index in currentExpression) {
            var word = currentExpression[index]
            if(this.expressions[word]){
              modifiedExpression = modifiedExpression.concat(this.expressions[word]);
            }
          else{
            modifiedExpression = modifiedExpression.concat(word)
          }
        }
        return modifiedExpression;
    }
}

module.exports = Executor