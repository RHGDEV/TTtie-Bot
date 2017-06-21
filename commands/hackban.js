module.exports = {
    exec: async function (msg, args) {
        if (args) {
            if (await bot.isModerator(msg.member)) {
                async function doBan(id, doMessage, isMass) {
                    let userToBan
                    try {
                        userToBan = await bot.getUserWithoutRESTMode(args)
                    } catch (err) {
                        if (doMessage) await msg.channel.createMessage("That user doesn't exist!")
                        return false;
                    }
                    try {
                        await msg.guild.banMember(userToBan.id, 0, `${isMass == false ? "Hackbanned" : "Masshackbanned"} by ${bot.getTag(msg.author)}`)
                        if (doMessage) await msg.channel.createMessage(":ok_hand:")
                        return true;
                    } catch (err) {
                        if (doMessage) await msg.channel.createMessage("Can't ban the user, do I lack the permission to?")
                        return false;
                    }
                }
                if (args.split(" ").length > 1) {
                    let bans = []
                    await args.split(" ").forEach(async u => {
                        let ban = await doBan(u, false, true)
                        bans.push(ban)
                    })
                    msg.channel.createMessage(`:ok_hand: Banned ${bans.filter(b => b == true).length} users.`)
                } else {
                    await doBan(args, true, false)
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
    description: "Bans a user by ID.",
    args: "<user id>"
}