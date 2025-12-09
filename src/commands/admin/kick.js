module.exports = {
    name: "kick",
    description: "Kick a member from the group",
    category: "admin",
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid

        // Check if it's a group
        if (!groupJid.endsWith("@g.us")) {
            return await sock.sendMessage(groupJid, { text: "This command can only be used in groups." })
        }
        
        const participants = msg.message.extendedTextMessage?.contextInfo?.mentionedJid

        if (!participants || participants.length === 0) {
            return await sock.sendMessage(groupJid, { text: "❌ Mention a member to kick!" }, { quoted: msg })
        }

        try {
            const groupMetadata = await sock.groupMetadata(groupJid)
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
            const senderId = msg.key.participant

            // Check if sender is an admin
            if (!admins.includes(senderId)) {
                return await sock.sendMessage(groupJid, { text: "You must be an admin to use this command." }, { quoted: msg })
            }

            await sock.groupParticipantsUpdate(groupJid, participants, "remove")
            await sock.sendMessage(groupJid, { text: `✅ Kicked: ${participants.map(p => `@${p.split("@")[0]}`).join(", ")}`, mentions: participants }, { quoted: msg })
        } catch (err) {
            console.error("Error in kick command:", err)
            await sock.sendMessage(groupJid, { text: "⚠ Failed to kick member. I might not be an admin or the user is the group owner." }, { quoted: msg })
        }
    }
}
