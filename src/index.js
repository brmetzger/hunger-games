//Require libraries
const DISCORD = require("discord.js");
    global.client = new DISCORD.Client();

//Require internal scripts
const CONFIG = require("./config.json");
const CMDSHANDLER = require("./cmds.js");
const SECRET = require("./data/secret.json");

//Bot started
client.on("ready",() => {
    console.log("Hunger Games bot successfully started!");
});

//Message sent
client.on("message", message => {
    if (message.content.startsWith("!")) {
        CMDSHANDLER.Scan(message);
    };
});

//Login to the bot
client.login(SECRET.token);