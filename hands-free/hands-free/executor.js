const vscode = require('vscode');
const _ = require('lodash');
const HtmlExecutor = require('./htmlExecutor');
const PythonExecutor = require('./pythonExecutor');
const { argv } = require('process');


//const { moveCursor } = require('readline');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {
    
    constructor(){
       
        this.expressions = {"equal": "=", "equals": "=", "not": "!", "lees": "<", "greater": ">"}; //less or equal
        this.instances = {
          html: new HtmlExecutor(),
          python:  new PythonExecutor()
        }
        this.currentLanguage = NaN
    }

    //auxiliar methods
    async getEditorState() {
        const language = vscode.window.activeTextEditor.document.languageId;
        var filename = vscode.window.activeTextEditor.document.fileName;
        this.currentLanguage = language;
    }

    async addComment(argvs) {
        this.getEditorState();
        if(this.instances[this.currentLanguage]){
            const text = this.instances[this.currentLanguage].addComment(argvs)
            this.insertText(text)
        }
        else {
            console.log("Not possible to add comment for this language");
        }
    }

    async getCurrentEditor() {
        const editor = vscode.window.activeTextEditor;
		await vscode.window.showTextDocument(editor.document);
    }
 
    getCursorPosition() {
        let activeEditor = vscode.window.activeTextEditor;
        let cursorPosition = activeEditor.selection.active;
        return cursorPosition
    }

    insertText(text) {
        var activeEditor = vscode.window.activeTextEditor;
        var cursorPosition = this.getCursorPosition()
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
        var pastedContent = await vscode.env.clipboard.readText(); 
        this.insertText(pastedContent);
    }

    // async addCommentHTML(argvs) { // add comment this is a comment 
    //     var cursorPosition = this.getCursorPosition();
    //     var content = argvs.join(" ")
    //     var compiled = _.template('<!--{{comment}}-->');
    //     const text = compiled({comment: content})
    //     this.insertText(cursorPosition, text)
    // }

    async addAttribute(argvs) { //add attribute id equals login  !!!!trebuie sa vad unde il adaug pe linia curenta
        this.getEditorState();
        if(this.instances[this.currentLanguage]) {
            const text = this.instances[this.currentLanguage].addAttribute(argvs)
            this.insertText(text);
        }
        else{
            console.log("doesn't exist")
        }
      
    }

    async openTag(argvs){ //open tag div
        this.getEditorState();
        if(this.instances[this.currentLanguage]) {
            const {text, isSingleTag }= this.instances[this.currentLanguage].openTag(argvs)
            this.insertText( text);

            if(isSingleTag) {
                return;
            }

            let lengthText = text.length;
            lengthText = (parseInt(lengthText/2))

            var p = new vscode.Position(0,lengthText);
            var s = new vscode.Selection(p, p);
            vscode.window.activeTextEditor.selection = s;
        }
        else {
            console.log("nop");
        }
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

    async addClass(argvs) { // toDo go down and type pass
        this.getEditorState();
        if(this.instances[this.currentLanguage]) {
            
            const text = this.instances[this.currentLanguage].addClass(argvs);
            this.insertText(text);
        }
        else {
            console.log("nop");
        }
    }

    async addMethod(argvs) {
        this.getEditorState();
        if(this.instances[this.currentLanguage]){
            const text = this.instances[this.currentLanguage].addMethod(argvs);
            this.insertText(text);
        }
        else {
            console.log("nop");
        }
      
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
    goToFunction(argvs) {
        this.getEditorState();
        if(this.instances[this.currentLanguage]){
            const functionName = this.instances[this.currentLanguage].goToFunction(argvs)
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
        else {
            console.log("Not possible to go to function for this language");
        }
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

    addParameter(argvs) {//////////////////////??????????????????????????
        //we are already in the function header --> search parameters and insert on the first position
        this.getEditorState();
        if(this.instances[this.currentLanguage]){
            const parameterName = this.instances[this.currentLanguage].addParameter(argvs);

            this.moveCursorAfterCharacter();
            this.insertText(parameterName);
        }
        else {
            console.log("nop");
        }
      
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