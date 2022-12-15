const vscode = require('vscode');
const _ = require('lodash');
const HtmlExecutor = require('./htmlExecutor');
const PythonExecutor = require('./pythonExecutor');
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

class Executor {

    constructor() {

        this.expressions = { "equal": "=", "equals": "=", "not": "!", "lees": "<", "greater": ">" }; //less or equal
        this.instances = {
            html: new HtmlExecutor(),
            python: new PythonExecutor()
        }
        this.currentLanguage = NaN
    }

    async test(argvs) {
        const currentFolder = vscode.workspace.workspaceFolders[0].uri;
        let directoryContent = await vscode.workspace.fs.readDirectory(currentFolder);
        directoryContent = directoryContent.map(function (x) { return x[0]; })
        directoryContent = directoryContent.map(function (x) {
            const indexOfExtension = x.indexOf('.');
            return [x.slice(0, indexOfExtension), x.slice(indexOfExtension + 1)]
        })

    }

    getRepo() {
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const api = gitExtension.getAPI(1);
        const repo = api.repositories[0];
        return repo;
    }

    async checkoutBranch(argvs) {  //!!! it brings the changes on the new branch
        const branchName = argvs.join(" ");
        const repo = this.getRepo();
        await repo.checkout(branchName);
    }

    async commitChanges(argvs) {
        const commitMessage = argvs.join(" ");
        const repo = this.getRepo();
        await repo.commit(commitMessage, { all: true });
    }

    async pushCommit() {
        const repo = this.getRepo();
        await repo.checkout("main");
    }

    async pullChanges() {
        const repo = this.getRepo();
        await repo.pull();
    }

    async mergeBase(argvs) {
        //toDo
    }

    async GITCANDIIVAVENITIMPUL(argvs) {
        //https://stackoverflow.com/questions/46511595/how-to-access-the-api-for-git-in-visual-studio-code
        //https://github.com/microsoft/vscode/blob/main/extensions/git/src/api/api1.ts#L160

        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const api = gitExtension.getAPI(1);

        const repo = api.repositories[0];
        const head = repo.state.HEAD;

        // Get the branch and commit 
        const { commit, name: branch } = head;

        // Get head of any other branch
        const mainBranch = 'main'
        const branchDetails = await repo.getBranch(mainBranch);

        // Get last merge commit
        const lastMergeCommit = await repo.getMergeBase(branch, mainBranch);

        const status = await repo.status();

        console.log({ branch, commit, lastMergeCommit, needsSync: lastMergeCommit !== commit });
    }

    ///////////////////// --------------- older version --------------- /////////////////////
    // createFilePath(argvs){ //python file file_name
    //     const currentFolder = vscode.workspace.workspaceFolders[0].uri.path;
    //     const languageToExtension = {
    //         "python": "py",
    //         "txt": "txt",
    //     }
    //     let filePath = NaN;
    //     if (languageToExtension[argvs[0]]) {
    //         const fileExtension = languageToExtension[argvs[0]]
    //         const fileName = _.camelCase(argvs.slice(1))
    //         filePath = currentFolder + '/' + fileName + '.' + fileExtension;
    //     }
    //     return filePath;
    // }

    filePath(fileName, fileExtension) { //"myFirstFile", "py"
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

    async openFile(argvs) {
        //directory content [['a', 'txt], ['a', 'json']....]

        const currentFolder = vscode.workspace.workspaceFolders[0].uri;
        let directoryContent = await vscode.workspace.fs.readDirectory(currentFolder);
        directoryContent = directoryContent.map(function (x) { return x[0]; })
        directoryContent = directoryContent.map(function (x) {
            const indexOfExtension = x.indexOf('.');
            return [x.slice(0, indexOfExtension), x.slice(indexOfExtension + 1)]
        })

        const searchedFile = _.camelCase(argvs);
        for (let file of directoryContent) { //take the first file with this name
            if (file[0] == searchedFile) {
                let filePath = this.filePath(searchedFile, file[1]);
                await vscode.window.showTextDocument(vscode.Uri.file(filePath));
                return;
            }
        }

        this.showErrorMesage();
    }

    async quickOpen() {
        await vscode.commands.executeCommand("workbench.action.quickOpen");
        // await vscode.commands.executeCommand("workbench.action.quickOpenPreviousRecentlyUsedEditor");
        // select command
        // enter command
    }

    async openCurrentFolder() {
        await vscode.commands.executeCommand("workbench.action.files.openFolderInNewWindow");
    }

    async insertTab() {
        await vscode.commands.executeCommand("tab");
    }
    async openTerminal() {
        await vscode.commands.executeCommand("workbench.action.files.openNativeConsole");
    }
    async clearTerminal() {
        await vscode.commands.executeCommand("workbench.action.terminal.clear");
    }

    async copyLineDown() {
        await vscode.commands.executeCommand("editor.action.copyLinesDownAction");
    }
    async copyLineUp() {
        await vscode.commands.executeCommand("editor.action.copyLinesUpAction");
    }
    async copyPath() {
        await vscode.commands.executeCommand("workbench.action.files.copyPathOfActiveFile");
    }



    markdownShowPreview() {
        vscode.commands.executeCommand("markdown.showPreview");
    }
    indentLine() {
        vscode.commands.executeCommand("editor.action.indentLines");
    }
    outdentLine() {
        vscode.commands.executeCommand("editor.action.outdentLines");
    }
    moveLineDown() {
        vscode.commands.executeCommand("editor.action.moveLinesDownAction");
    }
    moveLineUp() {
        vscode.commands.executeCommand("editor.action.moveLinesUpAction");
    }
    deleteLine() {
        vscode.commands.executeCommand("editor.action.deleteLines");
    }

    //auxiliar methods
    async getEditorState() {
        const language = vscode.window.activeTextEditor.document.languageId;
        this.currentLanguage = language;
    }

    async addComment(argvs) {
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
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
        let activeEditor = vscode.window.activeTextEditor;
        let cursorPosition = this.getCursorPosition()
        activeEditor.edit(editBuilder => {
            editBuilder.insert(cursorPosition, text)
        });
    }

    typeTextDocument(argvs) {
        let content = argvs.join(" ");
        this.insertText(content);
    }

    async runActiveFile() {
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            this.instances[this.currentLanguage].runActiveFile();

        }
        else {
            console.log("Not possible to run for this language");
        }
    }
    async typeCommandTerminal(argvs) {
        const content = argvs.join(" ")
        const terminal = vscode.window.activeTerminal;
        console.log(terminal)
        await terminal.sendText(content);
    }

    showErrorMesage(message = "Incorect format, please review the rules") {
        vscode.window.showInformationMessage(message);
    }
    copyToClipboard() {
        vscode.commands.executeCommand("editor.action.clipboardCutAction");
    }
    async cutText() {
        await vscode.commands.executeCommand("editor.action.clipboardCutAction");
    }



    // line l ==> at the beggining
    // column 0
    // right/left up/down --> one step
    moveCursor(argvs) {
        const editor = vscode.window.activeTextEditor;
        const cursorPosition = this.getCursorPosition();

        let nextLine = cursorPosition.line;
        let nextColumn = cursorPosition.character;

        if (argvs[0] === "line") {
            if (isNaN(parseInt(argvs[1]))) {
                this.showErrorMesage();
                return;
            }
            nextLine = parseInt(argvs[1]);
            nextColumn = 0;
        } else if (argvs[0] === "column") {
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

    async goToDefinition() {
        await vscode.commands.executeCommand("editor.action.revealDefinition");
    }

    // system function
    async undo() {
        this.getCurrentEditor();
        await vscode.commands.executeCommand("undo");
    }
    async saveFile() {
        this.getCurrentEditor();
        await vscode.commands.executeCommand("workbench.action.files.save");
    }
    async saveAllFiles() {
        await vscode.commands.executeCommand("workbench.action.files.saveFiles");
    }
    async closeFile() {
        this.getCurrentEditor();
        await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    }

    // inserting text
    async pasteFromClipboard() {
        let pastedContent = await vscode.env.clipboard.readText();
        this.insertText(pastedContent);
    }

    // async addCommentHTML(argvs) { // add comment this is a comment 
    //     let cursorPosition = this.getCursorPosition();
    //     let content = argvs.join(" ")
    //     let compiled = _.template('<!--{{comment}}-->');
    //     const text = compiled({comment: content})
    //     this.insertText(cursorPosition, text)
    // }

    async addAttribute(argvs) { //add attribute id equals login  !!!!trebuie sa vad unde il adaug pe linia curenta
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const text = this.instances[this.currentLanguage].addAttribute(argvs)
            this.insertText(text);
        }
        else {
            console.log("doesn't exist")
        }

    }

    async openTag(argvs) { //open tag div
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const { text, isSingleTag } = this.instances[this.currentLanguage].openTag(argvs)
            this.insertText(text);

            if (isSingleTag) {
                return;
            }

            let lengthText = text.length;
            lengthText = (parseInt(lengthText / 2))

            let p = new vscode.Position(0, lengthText);
            let s = new vscode.Selection(p, p);
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

    async addClass(argvs) { // toDo go down and type pass
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {

            const text = this.instances[this.currentLanguage].addClass(argvs);
            this.insertText(text);
            this.moveCursor(["down"]);
            this.insertText("pass");
        }
        else {
            console.log("nop");
        }
    }

    async addMethod(argvs) {
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const text = this.instances[this.currentLanguage].addMethod(argvs);
            this.insertText(text);
            this.moveCursor(["down"]);
            this.insertText("pass");
        }
        else {
            console.log("nop");
        }

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

    // find & select
    //https://stackoverflow.com/questions/67934437/vscode-is-there-any-api-to-get-search-results
    //https://javascript.info/regexp-introduction
    async findSelectAllPython(argvs) { //if function --> camel case, if parameter --> snake case
        const editor = vscode.workspace.textDocuments[0];///de 0???????????????????????????????????????
        const allText = editor.getText();
        let objectToFind = argvs.slice(1).join(" ");

        if (argvs[0] === "functions") {
            objectToFind = _.camelCase(objectToFind);
        }
        else if (argvs[0] === "variables") {
            objectToFind = _.snakeCase(objectToFind);
        }
        else {
            this.showErrorMesage();
        }

        let matches = [...allText.matchAll(new RegExp(`${objectToFind}`, "gm"))];
        let foundSelections = this.matchRegex(matches)
        let activeText = vscode.window.activeTextEditor;
        activeText.selection = foundSelections[0];
    }

    // toDo: find regex for function name
    goToFunction(argvs) {
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const functionName = this.instances[this.currentLanguage].goToFunction(argvs)
            const editor = vscode.workspace.textDocuments[0];
            const allText = editor.getText();
            let matches = [...allText.matchAll(new RegExp(`${functionName}`, "gm"))];

            let activeText = vscode.window.activeTextEditor;

            matches.forEach((match, index) => {
                let startPosition = activeText.document.positionAt(match.index);
                let newSelection = new vscode.Selection(startPosition, startPosition);
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
    evaluateTypeParameter(argvs) { //evaluates the paramater parameterValue [string, boolean, number]
        const lastArgument = argvs.at(-1);
        const parameterTypes = ["boolean", "number", "string"]
        let variableName = null
        if (parameterTypes.includes(lastArgument)) {
            if (lastArgument === "string") {
                argvs.pop();
                variableName = argvs.join(" ");
                variableName = '"' + variableName + '"';
            } else if (lastArgument == "boolean") {
                variableName = _.capitalize(argvs[0]);
            } else {
                variableName = argvs[0];
            }
        } else {
            variableName = _.snakeCase(argvs.join(" "));
        }
        return variableName
    }

    evaluateArguments(argvs, indexSeparator) { // separates de name of the parameter from the implicit value
        const parameterName = _.snakeCase(argvs.slice(0,indexSeparator).join(" "));
        let parameterValue = this.evaluateTypeParameter(argvs.slice(indexSeparator+1));
        let compiled = _.template('{{parameterName}}={{parameterValue}}');
        const text = compiled({ parameterName: parameterName, parameterValue: parameterValue });
        return text;  
    }

    addParameter(argvs) { //we are already in the function header --> search parameters and insert on the last position
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const regexForFunction = this.
                instances[this.currentLanguage].getRegexForFunction();
            const currentLine = this.getCursorPosition().line;

            const textCurrentLine = vscode.workspace.textDocuments[0].lineAt(currentLine).text;
            let matches = [...textCurrentLine.matchAll(regexForFunction)];
            let foundSelections = this.matchRegex(matches);
            let activeText = vscode.window.activeTextEditor;

            if (foundSelections[0]) {
                this.moveCursorBeforeCharacter();  
                let parameterExists = false;

                const regexForExistingParameter = /\(.+?\)/g;
                let matches = [...textCurrentLine.matchAll(regexForExistingParameter)];
                let foundSelections = this.matchRegex(matches);
                if(foundSelections[0]){
                    parameterExists = true;
                }

                const indexSeparator = argvs.indexOf("equals");
                let parameterName = _.snakeCase(argvs.join(" "));
                let text = parameterName;

                if (indexSeparator != -1) {
                    text = this.evaluateArguments(argvs, indexSeparator)
                }
                if(parameterExists) {
                    text = ", " + text;
                }
                this.insertText(text)      
            } else {
                this.showErrorMesage("Error: You should be with the cursor at a function!")
            }
            //const parameterName = this.instances[this.currentLanguage].addParameter(argvs);

            //this.moveCursorAfterCharacter();
            //this.insertText(parameterName);
        }
        else {
            console.log("nop");
        }
    }
    addReturn(argvs) { //add return function_name of string…./ argument_name
        this.getEditorState();
        if (this.instances[this.currentLanguage]) {
            const parameterValue = this.evaluateTypeParameter(argvs);
            const text = this.instances[this.currentLanguage].addReturn(parameterValue);
            //this.moveCursorAfterCharacter();
            this.insertText(text);
        }
        else {
            console.log("nop");
        }

    }


    evaluateExpressionPython(currentExpression) {  // i not equal zero --> i != 0
        let modifiedExpression = "";
        for (index in currentExpression) {
            let word = currentExpression[index]
            if (this.expressions[word]) {
                modifiedExpression = modifiedExpression.concat(this.expressions[word]);
            }
            else {
                modifiedExpression = modifiedExpression.concat(word)
            }
        }
        return modifiedExpression;
    }
}

module.exports = Executor