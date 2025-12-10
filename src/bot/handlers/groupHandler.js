const loadCommands = require("./commandHandler")
const settings = require("../../config/settings")

// Load commands once
const commands = loadCommands()

async function handleGroupMessage(sock, msg) {
    try {
        const sender = msg.key.remoteJid
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ""

        console.log(`[GROUP] From: ${sender} | Text: "${text}"`)

        // Check if message starts with prefix
        if (!text.startsWith(settings.prefix)) return

        // Extract command
        const args = text.slice(settings.prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (!commands.has(commandName)) {
            return await sock.sendMessage(sender, { text: "❌ Command not found. Type `!help` for available commands." })
        }

        const command = commands.get(commandName)

        // Check if command is available in groups
        if (command.category === "dm") {
            return await sock.sendMessage(sender, { text: "❌ This command only works in DMs." })
        }

        console.log(`[GROUP COMMAND] User: ${sender} | Command: ${commandName} | Args: ${args.join(" ")}`)
        await command.execute(sock, msg, args)
    } catch (error) {
        console.error("Error in group handler:", error)
        await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ An error occurred processing your message." })
    }
}

async function handleGroupUpdate(sock, update) {
    const { participants, action, id } = update

    if (action === "add") {
        for (const user of participants) {
            await sock.sendMessage(id, { text: `👋 Welcome @${user.split("@")[0]} to the group!`, mentions: [user] })
        }
    } else if (action === "remove") {
        for (const user of participants) {
            await sock.sendMessage(id, { text: `😢 Goodbye @${user.split("@")[0]}!`, mentions: [user] })
        }
    }
}

module.exports = { handleGroupMessage, handleGroupUpdate }
