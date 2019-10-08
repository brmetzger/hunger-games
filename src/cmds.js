//Require internal scripts
const COMMANDS = {
    "!volunteer":require("./cmds/volunteer.js")
};
const CONFIG = require("./config.json");

//Handle a command's execution
exports.Handle = function(command,message,args) {
    let permissionLevel = this.PermissionLevel(message.author);
    if (permissionLevel >= command.PermissionLevel) {
        //Player can use the command
    } else {
        message.reply(`You need to be a ${CONFIG.PermissionLevels[command.PermissionLevel]} to use this command!`);
    };
};

//Get a user's permissions level
exports.PermissionLevel = function(user) {

};

//Check if a message contains commands
exports.Scan = function(message) {
    let args = message.content.toLowerCase().split(" ");
    if (COMMANDS[args[0]]) {
        //Recognized command
        this.Handle(COMMANDS[args[0]],message,args);
    };
};
