module.exports = {
    name: "ping",
    description: "Check bot latency and status",
    category: "general",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        const startTime = Date.now()

        const pingMsg = await sock.sendMessage(sender, { text: "🏓 Pong! Calculating latency..." })
        const endTime = Date.now()
        const latency = endTime - startTime

        const responseText = `
🏓 *PONG!*

⚡ *Latency:* ${latency}ms
✅ *Status:* Online
🤖 *Bot:* MyGroupBot v1.0.0

Bot is working perfectly!
        `.trim()

        await sock.sendMessage(sender, { text: responseText })
    }
}
