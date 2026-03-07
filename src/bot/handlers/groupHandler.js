const loadCommands = require("./commandHandler")
const settings = require("../../config/settings")
const { checkLinkApproval } = require("./linkFilter")
const { addWarning, shouldKick } = require("./warnings")

// Load commands once
const commands = loadCommands()

async function handleGroupMessage(sock, msg) {
    try {
        const sender = msg.key.remoteJid
        const userId = msg.key.participant
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ""

        console.log(`[GROUP] From: ${sender} | Text: "${text}"`)

        // Check for unapproved links (before command processing)
        const linkCheck = await checkLinkApproval(sender, text)
        if (linkCheck.hasUnapprovedLinks && linkCheck.links.length > 0) {
            // Add warning for unapproved link
            const newWarnings = await addWarning(
                sender,
                userId,
                `Shared unapproved link: ${linkCheck.links[0]}`
            )

            // Build link list message
            const linksText = linkCheck.links.map((l) => `  • ${l}`).join("\n")
            let response = `⛔ **Unapproved Link Alert**\n\n`
            response += `❌ You shared a link that's not on the whitelist.\n\n`
            response += `🔗 Link(s) shared:\n${linksText}\n\n`
            response += `📋 Warnings: ${newWarnings}/3\n`

            if (newWarnings >= 3) {
                // Auto-kick the member
                await sock.groupParticipantsUpdate(sender, [userId], "remove")
                response = `⛔ **Auto-Kicked for Unapproved Links**\n\nYou have been removed from the group for sharing unapproved links.`
                await sock.sendMessage(sender, { text: response, mentions: [userId] }, { quoted: msg })
                return
            } else {
                const warningsLeft = 3 - newWarnings
                response += `⏳ **${warningsLeft} warning(s) left before removal**\n\n`
                response += `💡 Use !allowedlinks to see approved links`
            }

            await sock.sendMessage(sender, { text: response, mentions: [userId] }, { quoted: msg })
            return // Don't process message further if link was unapproved
        }

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
    const { participants, action, id } = update;

    for (const participant of participants) {
        // Baileys sends participant as an object; extract the ID
        const userId = typeof participant === "string" ? participant : participant.id;

        if (!userId) continue; // safety check

        if (action === "add") {
            await sock.sendMessage(id, {
                text: `👋 Welcome @${userId.split("@")[0]} to the group!`,
                mentions: [userId]
            });
        } else if (action === "remove") {
            await sock.sendMessage(id, {
                text: `😢 Goodbye @${userId.split("@")[0]}!`,
                mentions: [userId]
            });
        }
    }
}


module.exports = { handleGroupMessage, handleGroupUpdate }
