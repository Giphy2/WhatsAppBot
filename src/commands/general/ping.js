module.exports = {
    name: "ping",
    description: "Check if bot is online",
    category: "general",
    async execute(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" })
    }
}
