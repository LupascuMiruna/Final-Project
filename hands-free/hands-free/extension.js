const vscode = require('vscode');

const dispatcher = require('./dispatcher');
const socket = require('./utils/socket');

/**
 * 
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	await socket.initSubsribers(dispatcher);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "hands-free" is now active!');

	let disposable = vscode.commands.registerCommand('hands-free.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		// socket.on('onMessage', function (data) {
		// 	console.log(data)
		// 	vscode.window.showInformationMessage(data.text);
		// });
	});

	let trial = vscode.commands.registerCommand('hands-free.trial', function () {
		const filePath = `F:\\proiecte_an3\\Final-Project\\client-extension\\file.txt`
		const fileUri = vscode.Uri.file(filePath);

		// socket.on('onMessage', function (data) {

		// 	console.log(data)
		// 	vscode.workspace.fs.writeFile(fileUri, Buffer.from(data.text[0] || 'no response'))
		// });

	});

	let trial_v1 = vscode.commands.registerCommand('hands-free.trial_v1', async function () {
		// socket.on('onMessage', function (data) {
		// 	dispatcher.dispatch(data)
		// });
		// const data = ["open tag div"]
		// dispatcher.dispatch(data);

	});

	context.subscriptions.push(disposable, trial, trial_v1);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}