const _ = require('lodash');

class HtmlExecutor {
    constructor() {
        this.singleTags = ["area", "source", "br", "link", "input"];
    }
    addComment(argvs) {
        var content = argvs.join(" ")
        var compiled = _.template('<!--{{comment}}-->');
        const text = compiled({ comment: content })
        return text;
    }

    addAttribute(argvs) {
        const attribute = argvs[0];
        const name = argvs.slice(2).join("-")

        var compiled = _.template(' {{attribute}}="{{name}}"');
        const text = compiled({ attribute: attribute, name: name });
        return text;
    }
    openTag(argvs) {
        let tag = argvs[0];
        var compiled = NaN;
        var isSingleTag = false;
        var compiled = _.template('<{{tag}}></{{tag}}>');

        if (this.singleTags.includes(tag)) {
            var compiled = _.template('<{{tag}}>');
            isSingleTag = true;
        }
        const text = compiled({ tag: tag });

        return { text, isSingleTag };
    }
}

module.exports = HtmlExecutor;