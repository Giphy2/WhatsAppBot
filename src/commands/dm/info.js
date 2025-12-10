module.exports = {
    name: "info",
    description: "Show bot information",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        
        const infoText = `
🤖 *BOT INFORMATION*

*Name:* MyGroupBot
*Version:* 1.0.0
*Creator:* Giphy2

*Features:*
✅ Group Management Tools
✅ Fun & Entertainment Commands
✅ Direct Message Support
✅ Admin Controls
✅ User Moderation

*Available in:*
📱 Direct Messages
👥 Group Chats

*Need Help?*
Type \`!help\` to see all commands
Type \`!support\` for support info

*Links:*
🔗 GitHub: Giphy2/WhatsAppBot
📧 Contact: Use \`!feedback\` command
        `.trim()

        await sock.sendMessage(sender, { text: infoText })
    }
}
