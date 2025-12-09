module.exports = {
    name: "add",
    description: "Add a member to the group",
    category: "admin",
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid

        // Check if it's a group
        if (!groupJid.endsWith("@g.us")) {
            return await sock.sendMessage(groupJid, { text: "This command can only be used in groups." })
        }

        if (!args[0]) {
            return await sock.sendMessage(groupJid, { text: "❌ Provide a number to add!" }, { quoted: msg })
        }

        try {
            const groupMetadata = await sock.groupMetadata(groupJid)
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
            const senderId = msg.key.participant

            // Check if sender is an admin
            if (!admins.includes(senderId)) {
                return await sock.sendMessage(groupJid, { text: "You must be an admin to use this command." }, { quoted: msg })
            }

            const number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"

            await sock.groupParticipantsUpdate(groupJid, [number], "add")
            await sock.sendMessage(groupJid, { text: `✅ Added ${args[0]}` }, { quoted: msg })
        } catch (err) {
            console.error("Error in add command:", err)
            await sock.sendMessage(groupJid, { text: "⚠ Failed to add member. They may have privacy settings enabled or I might not be an admin." }, { quoted: msg })
        }
    }
}
