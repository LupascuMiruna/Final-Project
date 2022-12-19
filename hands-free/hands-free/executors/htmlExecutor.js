const _ = require('lodash');
const vscode = require('vscode');

const LanguageExecutor = require('./languageExecutor');

class HtmlExecutor extends LanguageExecutor {
    constructor() {
        super();
        this.singleTags = ['area', 'source', 'br', 'link', 'input'];
    }
    
    async addComment(argvs) {
        await this.getParsedExpression("alabala");
        let content = argvs.join(' ')
        let compiled = _.template('<!--{{comment}}-->');
        const text = compiled({ comment: content })
        
        this.insertText(text)
    }

    addAttribute(argvs) {
        const attribute = argvs[0];
        const name = argvs.slice(2).join('-')

        let compiled = _.template(' {{attribute}}="{{name}}"');
        const text = compiled({ attribute: attribute, name: name });
        this.insertText(text);
    }

    openTag(argvs) {
        let tag = argvs[0];
        let isSingleTag = false;
        let compiled = _.template('<{{tag}}></{{tag}}>');

        if (this.singleTags.includes(tag)) {
            compiled = _.template('<{{tag}}>');
            isSingleTag = true;
        }
        const text = compiled({ tag: tag });

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

}

module.exports = HtmlExecutor;