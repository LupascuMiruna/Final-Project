const vscode = require('vscode');
const io = require('socket.io-client');

const Dispatcher = require('./dispatcher');
const Executor = require('./executor');
const Client = require('./client');




const executor = new Executor();
const dispatcher = new Dispatcher(executor);
// const client = new Client(dispatcher);


// const socket = io.connect('http://localhost:3000', {reconnect: true});

// // Add a connect listener
// socket.on('connect', function () {
//     console.log('Connected!');
// });
// const executor = new Executor();
// const dispatcher = new Dispatcher(executor);
// socket.on('onMessage', function (data) {
// 			dispatcher.dispatch(data.alternatives)
// 		});

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

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
		const data = ["add method smile me"]
		dispatcher.dispatch(data)
		
	});

	context.subscriptions.push(disposable, trial, trial_v1);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}