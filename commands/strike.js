module.exports = {
    exec: function (msg, args) {
        let splitargs = args.split(" | ");
        let options = {};
        splitargs.forEach(async fe => {
            if (fe.match(/(user:([^]{0,36}))/i)) {
                if (!options.user) {
                    options.user = fe.replace(/user:/, "").replace(/ \\\| /g, " | ");
                }
            } else if (fe.match(/(reason:([^]{0,400}))/i)) {
                if (!options.reason) {
                    options.reason = fe.replace(/reason:/, "").replace(/ \\\| /g, " | ");
                }
            } else {
                console.log(fe + " doesn't match any regexes.");
            }
            if (!options.user) return msg.channel.createMessage("You're missing a user to strike.")
            let user;
            try {
                user = await userQuery(options.user, msg)
            } catch(err) {
                return
            }
            try {
                bot.modLog.addStrike(user.id, msg, options.reason)
            } catch(err) {
                msg.channel.createMessage(`Cannot strike the user for this reason: ${err.toString()}`)
            }
        })
    },
    isCmd: true,
    display: true,
    category: 3,
    description: "Strike someone",
    args: "<case id> <reason>"
};