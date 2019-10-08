//Require libraries
const DISCORD = require("discord.js");
    global.client = new DISCORD.Client();

//Require internal scripts
const CONFIG = require("./data/client.json");
const CMDSHANDLER = require("./cmds.js");

//Bot started
client.on("ready",() => {
    console.log("Hunger Games bot successfully started!");
});

//Login to the bot
client.login(CONFIG.token);