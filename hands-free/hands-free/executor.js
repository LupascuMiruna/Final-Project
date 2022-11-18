const vscode = require('vscode');
const _ = require('lodash');
const { moveCursor } = require('readline');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {
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
    async paste(){
        var cursorPosition = this.getCursorPosition();
        var pastedContent = await vscode.env.clipboard.readText(); 
        this.insertText(cursorPosition, pastedContent);
    }

    async addComment(argvs) { // at the moment just for html 
        var cursorPosition = this.getCursorPosition();
        var content = argvs.join(" ")
        var compiled = _.template('<!--{{comment}}-->');
        const text = compiled({comment: content})
        this.insertText(cursorPosition, text)

    }

    async openTag(argvs){
        let cursorPosition = this.getCursorPosition();
        let content = argvs[0];
       
        var compiled = _.template('<{{tag}}></{{tag}}>');
        const text = compiled({ tag: content });
        let lengthText = text.length
        lengthText = (parseInt(lengthText/2))

        this.insertText(cursorPosition, text);
        var p = new vscode.Position(0,lengthText);
        var s = new vscode.Selection(p, p);
        vscode.window.activeTextEditor.selection = s;
        
        cursorPosition = this.getCursorPosition();
        const x = 1;
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
  
}

module.exports = Executor