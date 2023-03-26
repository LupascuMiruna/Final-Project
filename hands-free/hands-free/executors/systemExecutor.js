const vscode = require('vscode');

const Executor = require('./executor');

class SystemExecutor extends Executor {
    constructor() {
        super();
    }

    getRepo() {
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const api = gitExtension.getAPI(1);
        const repo = api.repositories[0];
        return repo;
    }

    async gitCheckout(argvs) {  //!!! it brings the changes on the new branch
        const branchName = argvs.join(' ');
        const repo = this.getRepo();
        await repo.checkout(branchName);
    }

    async gitCommit(argvs) {
        const commitMessage = argvs.join(' ');
        const repo = this.getRepo();
        await repo.commit(commitMessage, { all: true });
    }

    async gitPush() {
        const repo = this.getRepo();
        await repo.push('origin', 'main', true)
        .then(() => console.log('Pushed changes to origin/main'))
        .catch((err) => console.error('Error pushing changes:', err));
    }

    async gitPull() {
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
        await this._executeCommand('workbench.action.quickOpen');
    }

    async openCurrentFolder() {
        await this._executeCommand('workbench.action.files.openFolderInNewWindow');
    }

    async insertTab() {
        await this._executeCommand('tab');
    }

    async openTerminal() {
        await this._executeCommand('workbench.action.terminal.toggleTerminal')
    }

    async clearTerminal() {
        await this._executeCommand('workbench.action.terminal.clear');
    }

    async copyLineDown() {
        await this._executeCommand('editor.action.copyLinesDownAction');
    }

    async copyLineUp() {
        await this._executeCommand('editor.action.copyLinesUpAction');
    }

    async copyPath() {
        await this._executeCommand('workbench.action.files.copyPathOfActiveFile');
    }

    markdownShowPreview() {
        this._executeCommand('markdown.showPreview');
    }

    indentLine() {
        this._executeCommand('editor.action.indentLines');
    }

    removeIndent() {
        this._executeCommand('editor.action.outdentLines');
    }

    moveLineDown() {
        this._executeCommand('editor.action.moveLinesDownAction');
    }

    moveLineUp() {
        this._executeCommand('editor.action.moveLinesUpAction');
    }

    deleteLine() {
        this._executeCommand('editor.action.deleteLines');
    }

    async typeCommandTerminal(argvs) {
        const content = argvs.join(' ')
        const terminal = vscode.window.activeTerminal;
        console.log(terminal)
        await terminal.sendText(content);
    }

    copyToClipboard() {
        this._executeCommand('editor.action.clipboardCopyAction');
    }

    async cutText() {
        await this._executeCommand('editor.action.clipboardCutAction');
    }

    async undo() {
        this.getCurrentEditor();
        await this._executeCommand('undo');
    }

    async saveFile() {
        this.getCurrentEditor();
        await this._executeCommand('workbench.action.files.save');
    }

    async saveAllFiles() {
        await this._executeCommand('workbench.action.files.saveFiles');
    }

    async closeFile() {
        this.getCurrentEditor();
        await
            this._executeCommand('workbench.action.closeActiveEditor');
    }

    async pasteFromClipboard() {
        let pastedContent = await vscode.env.clipboard.readText();
        this.insertText(pastedContent);
    }

    startDebug() {
        this._executeCommand('workbench.action.debug.start');
    }

    continueDebug() {
        this._executeCommand('workbench.action.debug.continue');
    }

    stopDebug() {
        this._executeCommand('workbench.action.debug.stop');
    }

    async inlineBreakpoint() {
        await this._executeCommand('editor.debug.action.toggleInlineBreakpoint');
    }

    async showHoverDebug() { ////???????????????
        this.getCurrentEditor();
        this._executeCommand('editor.debug.action.showDebugHover');
    }
}

module.exports = SystemExecutor;