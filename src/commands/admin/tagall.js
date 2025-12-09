module.exports = {
    name: "tagall",
    description: "Mention all members in the group",
    category: "admin",
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid

        // Check if it's a group
        if (!groupJid.endsWith("@g.us")) {
            return await sock.sendMessage(groupJid, { text: "This command can only be used in groups." })
        }

        try {
            const groupMetadata = await sock.groupMetadata(groupJid)
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)
            const senderId = msg.key.participant
    
            // Check if sender is an admin
            if (!admins.includes(senderId)) {
                return await sock.sendMessage(groupJid, { text: "You must be an admin to use this command." }, { quoted: msg })
            }
    
            const participants = groupMetadata.participants.map(p => p.id)
    
            const mentions = participants
            const text = `📢 Attention everyone:\n` + args.join(" ")
    
            await sock.sendMessage(groupJid, { text, mentions })
        } catch (error) {
            console.error("Error in tagall command:", error)
            await sock.sendMessage(groupJid, { text: "An error occurred while trying to tag everyone." }, { quoted: msg })
        }
    }
}
