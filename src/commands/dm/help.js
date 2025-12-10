module.exports = {
    name: "help",
    description: "Show all available commands",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        
        const helpText = `
📚 *BOT COMMANDS HELP*

*DM Commands:*
\`!help\` - Show this message
\`!info\` - Bot information
\`!ping\` - Check bot latency
\`!joke\` - Get a random joke
\`!quote\` - Get inspirational quote
\`!feedback <message>\` - Send feedback to owner
\`!support\` - Get support information

*Group Commands:*
\`!ping\` - Check bot status
\`!groupinfo\` - Show group details
\`!tagall <message>\` - Mention all members
\`!add <number>\` - Add member to group
\`!kick <@member>\` - Remove member
\`!promote <@member>\` - Make member admin
\`!demote <@member>\` - Remove admin rights

*Fun Commands:*
\`!joke\` - Random joke
\`!quote\` - Inspirational quote
\`!dice\` - Roll a dice
\`!flip\` - Flip a coin

For more info about a specific command, type: \`!help <command>\`
        `.trim()

        await sock.sendMessage(sender, { text: helpText })
    }
}
