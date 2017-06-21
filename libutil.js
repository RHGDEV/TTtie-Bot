const eris = require("eris").Client;
const s = require("superagent")
const ErisEndpoints = require("eris/lib/rest/Endpoints")
class LibWUtil extends eris {
    constuctor(token, options) {
        //super(token,options);
    }

    async postStats() {
        if (!config.dbotskey || config.dbotskey == "") return
        let data;
        try {
            data = await s.post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
                .set("Authorization", config.dbotskey)
                .send({ "server_count": this.guilds.size })
        } catch (err) {
            throw {
                message: "Can't post, access text or body property for more info.",
                text: r.text,
                body: r.body
            }
        }
        if (data.statusCode != 200) throw {
            message: "Can't post, access text or body property for more info.",
            text: r.text,
            body: r.body
        }
        return;

    }
    async postStats2() {
        if (!config.dbots2key || config.dbots2key == "") return;
                let data;
        try {
            data = await s.post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
                .set("Authorization", config.dbots2key)
                .send({ "server_count": this.guilds.size })
        } catch (err) {
            throw {
                message: "Can't post, access text or body property for more info.",
                text: r.text,
                body: r.body
            }
        }
        if (data.statusCode != 200) throw {
            message: "Can't post, access text or body property for more info.",
            text: r.text,
            body: r.body
        }
        return;
    }
    async isModerator(member) {
        if (isO({ author: member.user })) return true;
        if (member.permission.json["administrator"]) return true;
        if (member.guild.ownerID == member.id) return true;
        let serverHasModRole = false;
        let modRole = null;
        let server = await db.table("configs").get(member.guild.id).run()
        if (server) {
            let role = member.guild.roles.find(r => r.name == server.modRole);
            if (role) { serverHasModRole = true; modRole = role }
        } else {
            let role = member.guild.roles.find(r => r.name == "tt.bot mod");
            if (role) { serverHasModRole = true; modRole = role }
        }
        if (serverHasModRole) return member.roles.includes(modRole.id);
    }
    listBotColls() {
        return this.guilds.filter(g => ((g.members.filter(fn => fn.bot).length) / g.memberCount * 100) >= 75)
    }
    escapeMarkdown(string) {
        let replacedItallicsAndBold = string.replace(/\*/g, "\\*")
        let replacedBackticks = replacedItallicsAndBold.replace(/\`/g, "\\`");
        let replacedUnderscores = replacedBackticks.replace(/\_/g, "\\_");
        let replacedBrackets = replacedUnderscores.replace(/\[/g, "\\[").replace(/\(/, "\\(").replace(/\]/g, "\\]").replace(/\)/g, "\\)")
        return replacedBrackets
    }
    //actually Client.getRESTUser, but bypasses the need of options.restMode
    getUserWithoutRESTMode(userID) {
        return this.requestHandler.request("GET", ErisEndpoints.USER(userID), true).then((user) => new ErisO.User(user, this));
    }
    getBaseObject(id) {
        return new (require("eris/lib/structures/Base"))(id)
    }
    getTag(user) {
        return `${user.username}#${user.discriminator}`
    }

    embedToText(embed) {
        let txt = [];
        if (embed.title) txt.push(`----------${embed.title} ${embed.url ? `- ${embed.url}` : ""}----------`)
        if (embed.author) txt.push(`${embed.title ? "(" : ""}${embed.author.name || "noname"} - ${embed.author.icon_url || "noiconuri"} - ${embed.author.url || "nouri"}${embed.title ? ")" : ""}`)
        if (embed.description) txt.push(embed.description)
        if (embed.fields) embed.fields.forEach(f => {
            txt.push("--------------------")
            txt.push(f.name)
            txt.push("")
            txt.push(f.value)
            txt.push("--------------------")
        })
        if (embed.thumbnail) txt.push("THUMB: "+embed.thumbnail.url)
        if (embed.image) txt.push(`IMAGE: ${embed.image.url}`)
        if (embed.video) txt.push(`VIDEO: ${embed.video.url}`)
        if (embed.provider) txt.push(`PROVIDER: ${embed.provider.name} ${embed.provider.url}`)
        if (embed.footer) txt.push(`----------${embed.footer.text || "notext"} - ${embed.author.icon_url || "noiconuri"}----------`)
        return txt.join("\n");
    }
}
module.exports = LibWUtil