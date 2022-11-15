const vscode = require('vscode');
const _ = require('lodash');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {

    async getCurrentEditor() {
        const editor = vscode.window.activeTextEditor;
		await vscode.window.showTextDocument(editor.document);
    }
    async undo() {
        this.getCurrentEditor()
		await vscode.commands.executeCommand("undo");
    }
    async save() {
        this.getCurrentEditor()
        await vscode.commands.executeCommand("workbench.action.files.save");
    }
    async closeTab() {
        this.getCurrentEditor()
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
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

    async paste(){
        let cursorPosition = this.getCursorPosition();
        let pastedContent = await vscode.env.clipboard.readText(); 
        this.insertText(cursorPosition, pastedContent);
    }

    async open(argvs){
        let cursorPosition = this.getCursorPosition();
        let content = argvs[0];
       
        var compiled = _.template('<{{tag}}></{{tag}}>');
        const text = compiled({ tag: content });

        this.insertText(cursorPosition, text);
    }

    startDebug() {
        vscode.commands.executeCommand("workbench.action.debug.start");
    }

    continueDebug() {
        vscode.commands.executeCommand("workbench.action.debug.continue");
    }

    stopDebug() {
        vscode.commands.executeCommand("workbench.action.debug.stop");
    }
}

module.exports = Executor