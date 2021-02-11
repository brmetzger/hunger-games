const CONFIG = require("./config.json");
const DISCORD = require("discord.js");
const FS = require("fs");

//Setup the scenarios for Hunger Games
let scenarios = {};
exports.Setup = function() {
    function loadScenarios(path) {
        //Get the files as an array
        let output = [];
        let filenames = FS.readdirSync(`./scenarios/${path}`);
        filenames.forEach(filename => {
            let content = FS.readFileSync(`./scenarios/${path}/${filename}`, "utf-8")
            output[output.length] = JSON.parse(content);
        });
        return output;
    };
    scenarios["day"] = loadScenarios("day");
    scenarios["night"] = loadScenarios("night");
    scenarios["bloodbath"] = loadScenarios("bloodbath");
};

let pronouns = {
    "M":{
        "He/She":"He",
        "he/she":"he",
        "Him/Her":"Him",
        "him/her":"him",
        "His/Hers":"His",
        "his/hers":"his",
        "His/Her":"His",
        "his/her":"his"
    },
    "F":{
        "He/She":"She",
        "he/she":"she",
        "Him/Her":"Her",
        "him/her":"her",
        "His/Hers":"Hers",
        "his/hers":"hers",
        "His/Her":"Her",
        "his/her":"her"
    }
};
function formatScenario(scenario,tributes) {
    let output = scenario.Message;
    for (let i = 0;i < tributes.length;i++) {
        output = output.replaceAll("${P" + (i + 1) + "}",tributes[i].Name);
        for (let pronounset in pronouns[tributes[i].Gender]) {
            output = output.replaceAll("${P" + (i + 1) + pronounset + "}",pronouns[tributes[i].Gender][pronounset]);
        };
    };
    return output;
};

function tributeNames(tributes,killCount) {
    let output = "";
    if (tributes.length > 2) {
        for (let i = 0;i < tributes.length - 1;i++) {
            output += `${tributes[i].Name}${killCount && ` (${tributes[i].Kills} kill${tributes[i].Kills != 1 && "s" || ""})` || ""}, `
        };
        output += `and ${tributes[tributes.length - 1].Name}${killCount && ` (${tributes[tributes.length - 1].Kills} kill${tributes[tributes.length - 1].Kills != 1 && "s" || ""})` || ""}`;
    } else if (tributes.length == 2) {
        output = `${tributes[0].Name}${killCount && ` (${tributes[0].Kills} kill${tributes[0].Kills != 1 && "s" || ""})` || ""} and ${tributes[1].Name}${killCount && ` (${tributes[1].Kills} kill${tributes[1].Kills != 1 && "s" || ""})` || ""}`;
    } else if (tributes.length == 1) {
        output = `${tributes[0].Name}${killCount && ` (${tributes[0].Kills} kill${tributes[0].Kills != 1 && "s" || ""})` || ""}`;
    };
    return output;
};

var wait = ms => new Promise((r, j)=>setTimeout(r, ms));
async function handleSetting(sendmsg,tributes,killed,setting) {
    //Set up the list of tributes to be used
    let use_tributes = [];
    for (let i = 0;i < tributes.length;i++) {
        use_tributes[use_tributes.length] = tributes[i];
    };

    //Go through all the tributes
    while (use_tributes.length > 0) {
        let scenario = scenarios[setting][Math.floor(Math.random() * scenarios[setting].length)];
        if (scenario.Tributes <= use_tributes.length) {
            let scenario_tributes = [];
            for (let i = 0;i < scenario.Tributes;i++) { 
                let tribute = use_tributes[Math.floor(Math.random() * use_tributes.length)];
                scenario_tributes[scenario_tributes.length] = tribute;
                use_tributes.splice(use_tributes.indexOf(tribute),1);
            };
            
            //Kill off the dead tributes
            if (scenario.Killed) {
                //Credit the killers
                if (scenario.Killers) {
                    for (let i = 0;i < scenario.Killers.length;i++) {
                        tributes[tributes.indexOf(scenario_tributes[scenario.Killers[i]-1])].Kills += scenario.Killed.length;
                    };
                };
                for (let i = 0;i < scenario.Killed.length;i++) {
                    tributes.splice(tributes.indexOf(scenario_tributes[scenario.Killed[i]-1]),1);
                    killed[killed.length] = scenario_tributes[scenario.Killed[i]-1];
                };
            };

            //Print the scenario
            await wait(10000);
            sendmsg(formatScenario(scenario,scenario_tributes));
        };
    };
    return tributes, killed;
};

async function startGame(sendmsg,tributes) {
    //Announce the game's start
    sendmsg(`Welcome to the Hunger Games! The tributes below will be dropped into an arena in the middle of the wilderness, and the last one standing will be declared victor!\n\`${tributeNames(tributes)}\``);
    await wait(3000);
    sendmsg("A cornucopia full of goods that will help the tributes survive has been placed in the middle of the arena. Let the bloodbath begin!");

    //Setup the game
    let killed = [];
    let origCount = tributes.length;
    for (let i = 0;i<tributes.length;i++) {
        tributes[i].Kills = 0;
    };

    //Start the bloodbath
    tributes, killed = await handleSetting(sendmsg,tributes,killed,"bloodbath");
    let cycle = 0;
    while (tributes.length > 1) {
        cycle++;
        await wait(3000);
        sendmsg(`Day ${cycle}`);
        tributes, killed = await handleSetting(sendmsg,tributes,killed,"day");
        await wait(3000);
        if (tributes.length > 1) {
            if (killed.length > 0) {
                sendmsg(`The sun sets, and cannon shots can be heard in the distance in memorial of the tributes who died today.\n\`${tributeNames(killed,true)} ha${killed.length != 1 && "ve" || "s"} died. ${tributes.length} tributes remain.\``);
            } else {
                sendmsg("The sun sets, and no cannon shots are heard. No tributes were slain.");
            };
            killed = [];
            await wait(3000);
            sendmsg(`Night ${cycle}`);
            tributes, killed = await handleSetting(sendmsg,tributes,killed,"night");
        };
    };
    if (tributes.length > 0) {
        sendmsg(`${tributes[0].Name} is the victor of the Hunger Games with ${tributes[0].Kills} kill${tributes[0].Kills != 1 && "s" || ""}!`);
    } else {
        sendmsg(`${origCount} bodies were collected from the arena, but no victor could be found...`);
    };
};

function help(client,message,args) {
    //Setup the fields
    let fields = [];
    for (let command in exports.SubCommands) {
        fields[fields.length] = {name:command,value:exports.SubCommands[command].Description,inline:true};
    };

    message.reply(new DISCORD.MessageEmbed()
        .setTitle("Hunger Games Commands")
        .setDescription("The Hunger Games bot runs a simulated hunger games scenario using a list of tributes.")
        .addFields(fields)
    );
};

function pubstart(client,message,args) {
    startGame(function(content) {client.channels.cache.get(CONFIG.GameChannel).send(content);},[
        //This list can be as long as you need, recommended length is 24.
        {"Name":"John","Gender":"M"},
        {"Name":"Jane","Gender":"F"}
    ])
};

//Set up the commands
exports.Command = "hgames";

//Set up the subcommands
exports.SubCommands = {
    "help":{
        "Execute":help,
        "Description":"List all available commands."
    },
    "start":{
        "Execute":pubstart,
        "Description":"Start a new instance of the game."
    }
};