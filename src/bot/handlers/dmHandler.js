const loadCommands = require("./commandHandler")
const settings = require("../../config/settings")

// Load commands once
const commands = loadCommands()

const { getAIResponse } = require("./ai")

async function handleDMMessage(sock, msg) {
    try {
        const sender = msg.key.remoteJid
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ""

        console.log(`[DM] From: ${sender} | Text: "${text}"`)

        // AI chat: If message starts with @, treat as AI chat
        if (text.trim().startsWith("@")) {
            const userMessage = text.trim().slice(1).trim()
            // Personalize with user info (use phone as name for now)
            const userName = sender.split("@")[0]
            const aiReply = await getAIResponse(sender, userName, userMessage)
            await sock.sendMessage(sender, { text: aiReply })
            return
        }

        // Check if message starts with prefix (command)
        if (!text.startsWith(settings.prefix)) {
            await handleDMDefaultResponse(sock, sender, text)
            return
        }

        // Extract command
        const args = text.slice(settings.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (!commands.has(commandName)) {
            return await sock.sendMessage(sender, { text: "❌ Command not found. Type `!help` for available commands." })
        }

        const command = commands.get(commandName)

        // Check if command is available in DM
        if (command.category === "admin" || command.category === "group") {
            return await sock.sendMessage(sender, { text: "❌ This command only works in groups." })
        }

        console.log(`[DM COMMAND] User: ${sender} | Command: ${commandName} | Args: ${args.join(" ")}`)
        await command.execute(sock, msg, args)
    } catch (error) {
        console.error("Error in DM handler:", error)
        await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ An error occurred processing your message." })
    }
}

async function handleDMDefaultResponse(sock, sender, text) {
    // This is where AI response will be integrated in the future
    // For now, send a default response
    const response = `
👋 *Hello!* Thanks for messaging the bot.

Available DM Commands:
\`!help\` - Show all commands
\`!info\` - Bot information
\`!ping\` - Check bot status
\`!joke\` - Get a random joke
\`!quote\` - Get inspirational quote

Type a command with prefix \`!\` to get started.
    `.trim()

    await sock.sendMessage(sender, { text: response })
}

module.exports = { handleDMMessage }
