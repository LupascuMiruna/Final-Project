const vscode = require('vscode');

class Executor {
    async undo() {
        const editor = vscode.window.activeTextEditor;
		await vscode.window.showTextDocument(editor.document);
		await vscode.commands.executeCommand("undo");
    }
    async save() {
        const editor = vscode.window.activeTextEditor;
        await vscode.window.showTextDocument(editor.document);
        await vscode.commands.executeCommand("workbench.action.files.save");
    }
    async closeTab() {
        const editor = vscode.window.activeTextEditor;
        await vscode.window.showTextDocument(editor.document);
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
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