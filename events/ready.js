module.exports = function () {
    console.log(`${__filename}      | Connected as ${bot.user.username}#${bot.user.discriminator}`)
    global.connected = true;
    global.cmdWrap = require("../cmdwrapper")
    cmdWrap.loadAll()
    bot.editStatus("online", { name: `Type ${config.prefix}help` })
    bot.postStats().then(console.log(__filename + "     | Successfully posted!"), r => console.log(r.body))
    global.keymetricsMetrics = new keymetrics();
}
module.exports.isEvent = true