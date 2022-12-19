const vscode = require('vscode');
const _ = require('lodash');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {
    constructor() {
        this.expressions = { 'equal': '=', 'equals': '=', 'not': '!', 'lees': '<', 'greater': '>' }; //less or equal
        //this.instances = instances
    }
    // TODO: getParsedExpr ==> 
    // 1. create argvs
    // 2. send message socket.emit(onParse, argvs, data/ack => {.....})
    // 3. wait for response from server
    // 4. err handling
    // 5. return parsed


    async test(argvs) {
        // const currentFolder = vscode.workspace.workspaceFolders[0].uri;
        // let directoryContent = await vscode.workspace.fs.readDirectory(currentFolder);
        // directoryContent = directoryContent.map(function (x) { return x[0]; })
        // directoryContent = directoryContent.map(function (x) {
        //     const indexOfExtension = x.indexOf('.');
        //     return [x.slice(0, indexOfExtension), x.slice(indexOfExtension + 1)]
        // }
        await this._executeCommand('cursorDown');
    }

    async _executeCommand(action) {
        return this._executeCommand(`workbench.action.${action}`);
    }

    filePath(fileName, fileExtension) { //'myFirstFile', 'py'
        const currentFolder = vscode.workspace.workspaceFolders[0].uri.path;
        const filePath = currentFolder + '/' + fileName + '.' + fileExtension;
        return filePath
    }

    async createFile(name, extension) { //create file txt first file  / create file python main
        const fileName = _.camelCase(name)
        const filePath = this.filePath(fileName, extension);
        if (filePath != NaN) {
            await vscode.workspace.fs.writeFile(vscode.Uri.parse(filePath), new TextEncoder().encode(''));
            await vscode.window.showTextDocument(vscode.Uri.file(filePath));
        } else {
            this.showErrorMesage();
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
        let activeEditor = vscode.window.activeTextEditor;
        let cursorPosition = this.getCursorPosition()
        activeEditor.edit(editBuilder => {
            editBuilder.insert(cursorPosition, text)
        });
    }

    typeTextDocument(argvs) {
        let content = argvs.join(' ');
        this.insertText(content);
    }
    showErrorMesage(message = 'Incorect format, please review the rules') {
        vscode.window.showInformationMessage(message);
    }

    moveCursor(argvs) {
        const editor = vscode.window.activeTextEditor;
        const cursorPosition = this.getCursorPosition();

        let nextLine = cursorPosition.line;
        let nextColumn = cursorPosition.character;

        if (argvs[0] === 'line') {
            if (isNaN(parseInt(argvs[1]))) {
                this.showErrorMesage();
                return;
            }
            nextLine = parseInt(argvs[1]);
            nextColumn = 0;
        } else if (argvs[0] === 'column') {
            nextColumn = 0;
        } else if (argvs[0] === 'right') {
            nextColumn += 1;
        } else if (argvs[0] === 'left') {
            nextColumn = Math.max(nextColumn - 1, 0);
        } else if (argvs[0] === 'up') {
            nextLine = Math.max(nextLine - 1, 0);
        } else if (argvs[0] === 'down') {
            nextLine = nextLine + 1;
        } else {
            this.showErrorMesage();
            return;
        }

        let newPosition = new vscode.Position(nextLine, nextColumn);
        let newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }

    selectBlock(argvs) { //from line ls to line lf
        const editor = vscode.window.activeTextEditor;
        const startLine = parseInt(argvs[2]);
        const stopLine = parseInt(argvs[5]);

        if (isNaN(startLine) || isNaN(stopLine)) {
            this.showErrorMesage();
            return;
        }
        const startPosition = new vscode.Position(startLine - 1, 0);
        const stopPosition = new vscode.Position(stopLine, 0);
        let newSelection = new vscode.Selection(startPosition, stopPosition);
        editor.selection = newSelection;
    }

    matchRegex(matches, endEqualsStart=false) { // 2nd parameter for the moment we don't want to select the text
        let foundSelections = [];
        let activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            let startPosition = activeText.document.positionAt(match.index);
            let endPosition = activeText.document.positionAt(match.index + match[0].length);
            if(endEqualsStart) {
                endPosition = startPosition;
            }
            foundSelections[index] = new vscode.Selection(startPosition, endPosition);
        });
        return foundSelections;
    }
    moveCursorAfterCharacter() {
        const editor = vscode.workspace.textDocuments[0];
        const allText = editor.getText();
        const regexp = /(?<=\()/g; //for (
        let matches = [...allText.matchAll(regexp)];

        let activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            let startPosition = activeText.document.positionAt(match.index);
            let newSelection = new vscode.Selection(startPosition, startPosition);
            activeText.selection = newSelection;
        });
    }

    //at the moment before )
    moveCursorBeforeCharacter() { 
        const editor = vscode.workspace.textDocuments[0];
        const allText = editor.getText();
        const regexp = /.(?=\))/g; //for (
        let matches = [...allText.matchAll(regexp)];

        let activeText = vscode.window.activeTextEditor;

        matches.forEach((match, index) => {
            let startPosition = activeText.document.positionAt(match.index + 1);
            let newSelection = new vscode.Selection(startPosition, startPosition);
            activeText.selection = newSelection;
        });
    }
}
module.exports = Executor;
