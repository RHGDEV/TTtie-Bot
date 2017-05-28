module.exports = {
    exec: async function (msg, args) {
        if (args) {
            if (await bot.isModerator(msg.member)) {
                try {
                    let user = await userQuery(args, msg)
                    await user.ban(1, `Banned by ${bot.getTag(msg.author)}`);
                    await msg.channel.createMessage(`:ok_hand: Banned ${bot.getTag(user)}.`)
                } catch(err) {
                    bot.createMessage(msg.channel.id, "```xl\nError:\n" + err + "\n```").then(null, console.error)
                    console.error(err)
                }
            }
        } else {
            return await bot.createMessage(msg.channel.id, `**${msg.author.username}**, you miss required arguments.`)
        }
    },
    isCmd: true,
    name: "ban",
    display: true,
    category: 3,
    description: "Bans a user.",
    args: "<user>"
}