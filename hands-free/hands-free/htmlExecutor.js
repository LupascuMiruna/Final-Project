const _ = require('lodash');

class HtmlExecutor {
    constructor() {
        this.singleTags = ["area", "source", "br", "link", "input"];
    }
    addComment(argvs) {
        let content = argvs.join(" ")
        let compiled = _.template('<!--{{comment}}-->');
        const text = compiled({ comment: content })
        return text;
    }

    addAttribute(argvs) {
        const attribute = argvs[0];
        const name = argvs.slice(2).join("-")

        let compiled = _.template(' {{attribute}}="{{name}}"');
        const text = compiled({ attribute: attribute, name: name });
        return text;
    }
    openTag(argvs) {
        let tag = argvs[0];
        let compiled = NaN;
        let isSingleTag = false;
        let compiled = _.template('<{{tag}}></{{tag}}>');

        if (this.singleTags.includes(tag)) {
            let compiled = _.template('<{{tag}}>');
            isSingleTag = true;
        }
        const text = compiled({ tag: tag });

        return { text, isSingleTag };
    }
}

module.exports = HtmlExecutor;