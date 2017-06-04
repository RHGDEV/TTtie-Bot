module.exports = {
    exec: function(msg,args) {
        return bot.createMessage(msg.channel.id, "Pinging.......").then(m =>{
            m.edit(`It took ${m.timestamp - msg.timestamp}ms to ping.\n\nDiscord latency: ${msg.guild.shard.latency}ms`)
        })
    },
    isCmd: true,
    name: "ping",
    display: true,
    category: 1,
    description: "Check if the bot is working.",
    aliases: [
        "pang",
        "pong",
        "pung",
        "pwng",
        "peng"
    ]
}