var alternatives = ["add file up you"]

var commands = {
    "add": {
        "file": "addFile",
        "comment": "addComent"
    }
}
const isDict = dict => {
    return typeof dict === "object" && !Array.isArray(dict);
  };
  
for(const alternative of alternatives) {
    alternative.toLocaleLowerCase()
    const words = alternative.split(' ');
    var index = 0;
    var commandFound = false;
    var commandToLook = commands
    while(commandFound == false) {
        if(commandToLook[words[index]]) {
            commandToLook = commandToLook[words[index]];
            index += 1;
            if(! isDict(commandToLook)){
                commandFound = true;
                console.log(words.slice(index))
                //this.executor[commandToLook](words.slice(index));
            }
        }
        else {
            console.log("not found")
            break;
        } 
    }
}