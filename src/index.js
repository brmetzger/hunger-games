//Require internal modules
const DISCORD = require("discord.js");
    const client = new DISCORD.Client();
const HUNGER_GAMES = require("./hungergames.js");
    HUNGER_GAMES.Setup();

//Load the modules set up for commands
const COMMAND_MODULES = {
    [HUNGER_GAMES.Command]:HUNGER_GAMES
};

client.on("message",(message) => {
    if (message.content.startsWith(CONFIG.CommandPrefix)) {
        let args = message.content.split(" ");
        if (COMMAND_MODULES[args[0].replace(CONFIG.CommandPrefix,"")]) {
            if (COMMAND_MODULES[args[0].replace(CONFIG.CommandPrefix,"")].SubCommands) {
                if (COMMAND_MODULES[args[0].replace(CONFIG.CommandPrefix,"")].SubCommands[args[1].toLowerCase()]) {
                    COMMAND_MODULES[args[0].replace(CONFIG.CommandPrefix,"")].SubCommands[args[1].toLowerCase()].Execute(client,message,args);
                };
            } else {
                COMMAND_MODULES[args[0].replace(CONFIG.CommandPrefix,"")].Execute(client,message,args);
            };
        };
    };
});

client.login(YOUR_TOKEN);