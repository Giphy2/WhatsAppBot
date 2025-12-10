module.exports = {
    name: "feedback",
    description: "Send feedback to the bot owner",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        
        if (args.length === 0) {
            return await sock.sendMessage(sender, { text: "❌ Please provide feedback. Usage: `!feedback <your message>`" })
        }

        const feedbackMessage = args.join(" ")
        const timestamp = new Date().toLocaleString()
        const senderName = sender.split("@")[0]

        // Log feedback (could be enhanced with database)
        console.log(`[FEEDBACK] From: ${sender} | Message: ${feedbackMessage} | Time: ${timestamp}`)

        const confirmText = `
✅ *FEEDBACK RECEIVED*

Thank you for your feedback! 🙏

Your message has been recorded and will be reviewed.

*Message:* "${feedbackMessage}"
*Time:* ${timestamp}

We appreciate your input and will use it to improve the bot!
        `.trim()

        await sock.sendMessage(sender, { text: confirmText })
    }
}
