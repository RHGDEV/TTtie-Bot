let origBot = null, origGuild = null;
const Message = require("./Message");
const User = require("./User");
const Guild = require("./Guild");
class Client {
    constructor(bot, guild) {
        origBot = bot;
        origGuild = guild;
        // noinspection JSValidateTypes
        this.user = new User(bot.user);
        this.currentGuild = new Guild(guild);
    }

    // noinspection JSMethodCanBeStatic
    get guilds() {
        return origBot.guilds.size;
    }

    // noinspection JSMethodCanBeStatic
    get users() {
        return origBot.users.size;
    }

    waitForMessage(authorId, channelId, timeout, check) {
        if (!authorId || !channelId) return Promise.reject("Missing author/channel ID");
        if (!check || typeof check !== "function") check = () => true;
        let c = msg => {
            if (msg.author.id === authorId && msg.channel.id === channelId
                && msg.channel.guild && msg.channel.guild.id === origGuild.id
                && check(msg)) return true;
            else return false;
        };
        origBot.waitForEvent("messageCreate", timeout, c)
            .then((eventReturn) => new Message(eventReturn[0]));
    }
}
module.exports = Client;