const vscode = require("vscode");
const _ = require("lodash");
// const extensionFiles = require('./extensionFiles.json');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const socketManager = require("../utils/socket");

class Executor {
  constructor() {
    this.expressions = {
      equal: "=",
      equals: "=",
      not: "!",
      lees: "<",
      greater: ">",
    }; //less or equal
    //this.instances = instances
  }
  // TODO: getParsedExpr ==>
  // 1. create argvs
  // 2. send message socket.emit(onParse, argvs, data/ack => {.....})
  // 3. wait for response from server
  // 4. err handling
  // 5. return parsed

  async getParsedExpression(expression) {
    let parsedExpression = null;

    try {
      parsedExpression = await socketManager.parseExpression(expression);
    } catch (err) {
      console.error(err);
    }

    return parsedExpression || '';
  }

  async test(argvs) {
    // const currentFolder = vscode.workspace.workspaceFolders[0].uri;
    // let directoryContent = await vscode.workspace.fs.readDirectory(currentFolder);
    // directoryContent = directoryContent.map(function (x) { return x[0]; })
    // directoryContent = directoryContent.map(function (x) {
    //     const indexOfExtension = x.indexOf('.');
    //     return [x.slice(0, indexOfExtension), x.slice(indexOfExtension + 1)]
    // }
    await this._executeCommand("cursorDown");
  }

  async _executeCommand(action) {
    return vscode.commands.executeCommand(action);
  }

  filePath(fileName, fileExtension) {
    //'myFirstFile', 'py'
    const currentFolder = vscode.workspace.workspaceFolders[0].uri.path;
    const filePath = currentFolder + "/" + fileName + "." + fileExtension;
    return filePath;
  }

  async addFile(argvs) {
    //add file txt first file  / add file python main
    let extension = argvs[0];
    argvs = argvs.slice(1)
    const fileName = _.camelCase(argvs.join(''));

    if(extension == "python") {
      extension = "py";
    } else {
      extension = "txt";
    }

    const filePath = this.filePath(fileName, extension);
    if (filePath != NaN) {
      await vscode.workspace.fs.writeFile(
        vscode.Uri.parse(filePath),
        new TextEncoder().encode("")
      );
      await vscode.window.showTextDocument(vscode.Uri.file(filePath));
    } else {
      this.showErrorMesage(argvs.join(' '));
      return;
    }
  }
 
  _getTextEditor() {
    return vscode.window.activeTextEditor;
  }

  async getCurrentEditor() {
    const editor = this._getTextEditor();
    await vscode.window.showTextDocument(editor.document);
  }

  getCursorPosition() {
    let activeEditor = this._getTextEditor();
    let cursorPosition = activeEditor.selection.active;
    return cursorPosition;
  }

  insertText(text) {
    let activeEditor = this._getTextEditor();
    let cursorPosition = this.getCursorPosition();
    activeEditor.edit((editBuilder) => {
      editBuilder.insert(cursorPosition, text);
    });
  }

  typeTextDocument(argvs) {
    let content = argvs.join(" ");
    this.insertText(content);
  }

  showErrorMesage(argvs = '') {
    const message = "Incorrect format, please review the rules: "
    vscode.window.showInformationMessage(message + argvs);
  }

  _changeCursorPosition(line, column) {
    const editor = this._getTextEditor();
    let newPosition = new vscode.Position(line, column);
    let newSelection = new vscode.Selection(newPosition, newPosition);
    editor.selection = newSelection;
  }

  moveCursor(argvs) {
    const editor = this._getTextEditor();
    const cursorPosition = this.getCursorPosition();

    let nextLine = cursorPosition.line;
    let nextColumn = cursorPosition.character;

    if (argvs[0] === "line") {
      if (isNaN(parseInt(argvs[1]))) {
        this.showErrorMesage(argvs.join(' '));
        return;
      }
      nextLine = parseInt(argvs[1]) - 1;
      nextColumn = 0;
    } else if (argvs[0] === "column") {
      if (isNaN(parseInt(argvs[1]))) {
        this.showErrorMesage(argvs.join(' '));
        return;
      }
      nextColumn = parseInt(argvs[1]) - 1;
    } else if (argvs[0] === "right") {
      nextColumn += 1;
    } else if (argvs[0] === "left") {
      nextColumn = Math.max(nextColumn - 1, 0);
    } else if (argvs[0] === "up") {
      nextLine = Math.max(nextLine - 1, 0);
    } else if (argvs[0] === "down") {
      nextLine = nextLine + 1;
    } else {
      this.showErrorMesage(argvs.join(' '));
      return;
    }
    this._changeCursorPosition(nextLine, nextColumn);
  }

  // works also for the last line of the document
  // inserts a new line below the current
  insertLine(argvs){
    const editor = this._getTextEditor();
    if (editor) {
        const currentPosition = this.getCursorPosition();
        this._executeCommand('editor.action.insertLineAfter');
        editor.selection = new vscode.Selection(currentPosition.translate(1), currentPosition.translate(1));
    }
  }

  selectBlock(argvs) {
    //from line ls to line lf
    const editor = this._getTextEditor();
    const startLine = parseInt(argvs[2]);
    const stopLine = parseInt(argvs[5]);

    if (isNaN(startLine) || isNaN(stopLine)) {
      this.showErrorMesage(argvs.join(' '));
      return;
    }
    const startPosition = new vscode.Position(startLine - 1, 0);
    const stopPosition = new vscode.Position(stopLine, 0);
    let newSelection = new vscode.Selection(startPosition, stopPosition);
    editor.selection = newSelection;
  }

  matchRegex(matches, endEqualsStart = false) {
    // 2nd parameter for the moment we don't want to select the text
    let foundSelections = [];
    let activeText = this._getTextEditor();

    matches.forEach((match, index) => {
      let startPosition = activeText.document.positionAt(match.index);
      let endPosition = activeText.document.positionAt(
        match.index + match[0].length
      );
      if (endEqualsStart) {
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

    let activeText = this._getTextEditor();

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

    let activeText = this._getTextEditor();

    matches.forEach((match, index) => {
      let startPosition = activeText.document.positionAt(match.index + 1);
      let newSelection = new vscode.Selection(startPosition, startPosition);
      activeText.selection = newSelection;
    });
  }
}
module.exports = Executor;
