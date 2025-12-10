module.exports = {
    name: "support",
    description: "Get support information",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        
        const supportText = `
🆘 *SUPPORT INFORMATION*

*Need Help?*

1. **Command Issues:**
   Type \`!help\` to see all available commands
   Make sure commands start with \`!\`

2. **Group Management:**
   For group-related issues, use commands in the group chat
   Available group commands: !tagall, !add, !kick, !promote, !demote

3. **Report Issues:**
   Type \`!feedback <your message>\` to report bugs or issues
   Your feedback helps us improve!

4. **Bot Not Responding:**
   - Check your internet connection
   - Ensure bot is added to the group
   - Try again in a few moments

5. **Privacy & Safety:**
   - Never share your personal info
   - Commands are case-insensitive
   - All commands start with \`!\`

*Contact:*
📧 Send feedback with: \`!feedback <message>\`
📱 Add bot to your group to use group commands

Need something else? Type \`!help\` for all commands!
        `.trim()

        await sock.sendMessage(sender, { text: supportText })
    }
}
