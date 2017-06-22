module.exports = async function (msg) {
    if (!msg.author) return; // Message.author is occasionally undefined. abal plz fix
    if (msg.author.bot) return; // ignore bots
    if (msg.channel instanceof ErisO.PrivateChannel) {
        if (config.reroutePMs) {
            let pm = await this.getDMChannel(config.oid)
            let embedString = msg.embeds.map(a => `\`\`\`\n${this.embedToText(a)}\`\`\`\n`).join("\n")
            let attachmentString = msg.attachments.map(a => a.url).join("\n")
            let embed = {
                author: {
                    name: `${this.getTag(msg.author)} sent a PM to me!`,
                    icon_url: msg.author.avatarURL
                },
                description: `${msg.content}\n${attachmentString}\n${embedString}`
            }
            try {
                await this.createMessage(pm.id, {
                    embed
                })
            } catch (err) {
                console.log(this.embedToText(embed))
            }
        }
        return; // ignore DMs
    }
    if (msg.channel.topic && msg.channel.topic.includes("[tt.bot block]")) return // we ignore the channel when [tt.bot block] is anywhere in the message.
    let server = await db.table("configs").get(msg.guild.id).run();
    msg.guildConfig = server;
    if ((server && msg.content.startsWith(server.prefix)) || msg.content.startsWith(config.prefix)) { // if the content starts with the prefix
        let nameslice = (server && msg.content.startsWith(server.prefix)) ? msg.content.slice(server.prefix.length) : msg.content.slice(config.prefix.length) // we slice it so we can get the command
        let cmdName = nameslice.split(" ")[0]; //  we split the slice output by spaces and choosing the command from the first element
        let args = nameslice.slice(cmdName.length).slice(1); // we determine arguments
        let cmdAlias = cmdAliases[cmdName.toLowerCase()]
        try {
            let cmd = cmds[cmdName.toLowerCase()]; // we load it from object
            if (!cmd) cmd = cmds[cmdAlias]
            if (cmd) {
                console.log(
`Received a command message
    From ${this.getTag(msg.author)} (${msg.author.id})
    Guild ${msg.guild.name} (${msg.guild.id})
    Command ${cmdName}
${args ? `    Arguments ${args}` : ""}
`
                )
                let e = cmd.exec(msg, args); // we execute it
            }
        } catch (err) {
            console.error(err); // if an error is thrown, we log it.
        }
    }
}
module.exports.isEvent = true; // event declaration