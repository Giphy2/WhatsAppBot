module.exports = {
    name: "help",
    description: "Show all available commands",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        
        const helpText = `
📚 *BOT COMMANDS HELP*

*📬 DM Commands:*
\`!help\` - Show this message
\`!info\` - Bot information
\`!ping\` - Check bot latency
\`!chat <message>\` - Chat with AI
\`!joke\` - Get a random joke
\`!quote\` - Get inspirational quote
\`!feedback <message>\` - Send feedback to owner
\`!support\` - Get support information

*👥 Group Commands - Management:*
\`!ping\` - Check bot status
\`!groupinfo\` - Show group details
\`!tagall <message>\` - Mention all members
\`!add <number>\` - Add member to group
\`!kick <@member>\` - Remove member

*⚠️ Group Commands - Warnings:*
\`!warn <@member> [reason]\` - Issue warning to member
\`!warnings [@member]\` - Check warnings or list all
\`!clearwarnings <@member>\` - Clear all warnings

*🔗 Group Commands - Link Whitelist:*
\`!addlink <url> [description]\` - Add link to whitelist
\`!removelink <url>\` - Remove link from whitelist
\`!allowedlinks\` - View all whitelisted links

*🎮 Fun Commands:*
\`!joke\` - Random joke
\`!quote\` - Inspirational quote
\`!dice\` - Roll a dice
\`!flip\` - Flip a coin

ℹ️ *Admin Required:* Warnings & Link Whitelist commands require group admin

For more info: \`!help <command>\`
        `.trim()

        await sock.sendMessage(sender, { text: helpText })
    }
}
