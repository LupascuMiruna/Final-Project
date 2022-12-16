const vscode = require('vscode');

class LanguageExecutor {
    insertText(text) {
        const activeEditor = vscode.window.activeTextEditor;
        const cursorPosition = this.getCursorPosition()
        activeEditor.edit(editBuilder => {
            editBuilder.insert(cursorPosition, text)
        });
    }

    getCursorPosition() {
        const activeEditor = vscode.window.activeTextEditor;
        const cursorPosition = activeEditor.selection.active;
        
        return cursorPosition
    }
}

module.exports = LanguageExecutor;