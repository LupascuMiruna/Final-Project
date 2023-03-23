const _ = require('lodash');
const vscode = require('vscode');

const LanguageExecutor = require('./languageExecutor');

class HtmlExecutor extends LanguageExecutor {
    constructor() {
        super();
        this.singleTags = ['area', 'source', 'br', 'link', 'input'];
        this.notInlineTags = ['html', 'body', 'div']
    }
    
    async addComment(argvs) {
        let content = await this.getParsedExpression(argvs.join(' '));
        // let content = argvs.join(' ')
        let compiled = _.template('<!--{{comment}}-->');
        const text = compiled({ comment: content })
        
        this.insertText(text)
    }

    addAttribute(argvs) {
        const attribute = argvs[0];
        const name = argvs.slice(1).join('-')

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
        this._changeCursorPosition(undefined, lengthText)

        if(this.notInlineTags.includes(tag)) {
            this.insertLine();
        }
    }

    insertDoctype(argvs) {
        const text = "<!DOCTYPE html>";
        this.insertText(text);
        this.insertLine()
    }
}

module.exports = HtmlExecutor;