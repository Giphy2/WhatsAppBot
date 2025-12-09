module.exports = {
    name: "lock",
    description: "Lock the group (admins only can send messages)",
    category: "admin",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        if (!sender.endsWith("@g.us")) return

        try {
          await sock.groupSettingUpdate(sender, "not_announcement") // everyone can send messages
          await sock.sendMessage(sender, { text: "🔒 Group has been locked! Only admins can send messages." })
        } catch (err) {
            console.error(err)
            await sock.sendMessage(sender, { text: "⚠ Failed to unlock group" })
        }
    }
}
