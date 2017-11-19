module.exports = {
    exec: async function (msg, args) {
        let splitargs = args.split(" | ");
        let options = {};
        splitargs.forEach(async fe => {
            if (fe.match(/(punishment-id:([^]{0,34}))/i)) {
                if (!options.punishmentID) {
                    options.punishmentID = fe.replace(/punishment-id:/, "").replace(/ \\\| /g, " | ");
                }
            } else if (fe.match(/(reason:([^]{0,400}))/i)) {
                if (!options.reason) {
                    options.reason = fe.replace(/reason:/, "").replace(/ \\\| /g, " | ");
                }
            } else {
                console.log(fe + " doesn't match any regexes.");
            }
        });
        
        if (!options.punishmentID) return msg.channel.createMessage("You're missing a case ID.");
        try {
            await bot.modLog.removeStrike(options.punishmentID, msg, options.reason);
            const dm = await user.user.getDMChannel()
            dm.createMessage({
                embed: {
                    title: "Your strike was removed!",
                    description: `The strike removal was issued by ${bot.getTag(msg.author)} for reason \`${options.reason || "No reason"}\`.`,
                    footer: {
                        text: "Beware on what you're doing!"
                    },
                    timestamp: new Date()
                }
            })
        } catch(err) {
            msg.channel.createMessage(`Cannot remove the strike for this reason: ${err.toString()}`);
        }
    },
    isCmd: true,
    display: true,
    category: 3,
    description: "Strike someone\nThe command uses `\u200b | \u200b` as separators (note the spaces). Use ` \\| ` to escape the separation in your queries.\nThe order of the switches doesn't need to be followed.",
    args: "<punishment-id:<case id>>[ | <reason:<reason>>]",
    aliases: ["rmpunish", "deletepunishment", "removepunishment", "rmstrike", "delstrike", "removestrike", "removepunishment"]
};