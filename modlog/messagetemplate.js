const {PunishTexts, PunishColors, PunishTypes} = require("./constants")
module.exports = function generateMessage(type, id, user, issuer, reason) {
    if (!Object.values(PunishTypes).find(t => t == type)) throw new Error("Invalid punishment type")
    return {
        title: `${PunishTexts[type] ? PunishTexts[type] : "Unknown type"} ${id ? `| ${id}` : ""}`,
        author: {
            name: bot.getTag(user),
            icon_url: user.avatarURL
        },
        fields: [{
            name: "Reason",
            value: reason || `No reason. You can use ${config.prefix}reason <case ID> <reason>`
        }],
        footer: {
            text: `Strike issued by ${bot.getTag(issuer)}`,
            icon_url: issuer.avatarURL
        },
        color: PunishColors[type] || null
    }
}