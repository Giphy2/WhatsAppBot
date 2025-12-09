module.exports = {
    name: "groupinfo",
    description: "Show group details (member count, admins, creation date)",
    category: "general",
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid

        // Check if it's a group
        if (!groupJid.endsWith("@g.us")) {
            return await sock.sendMessage(groupJid, { text: "This command can only be used in groups." })
        }

        try {
            const groupMetadata = await sock.groupMetadata(groupJid)
            
            const groupName = groupMetadata.subject
            const totalMembers = groupMetadata.participants.length
            const admins = groupMetadata.participants.filter(p => p.admin)
            const adminList = admins.map(a => {
                const name = a.notify || a.id.split("@")[0]
                return `  • ${name}`
            }).join("\n")
            
            // Get creation date (convert from seconds to milliseconds)
            const createdDate = new Date(groupMetadata.creation * 1000).toLocaleDateString()
            
            // Get group owner/creator
            const owner = groupMetadata.owner ? groupMetadata.owner.split("@")[0] : "Unknown"
            
            const groupDesc = groupMetadata.desc || "No description"

            const infoText = `
📊 *GROUP INFORMATION*

*Name:* ${groupName}
*Members:* ${totalMembers}
*Admins:* ${admins.length}
*Created:* ${createdDate}
*Owner:* ${owner}

*Description:*
${groupDesc}

*Admins List:*
${adminList}
            `.trim()

            await sock.sendMessage(groupJid, { text: infoText })
        } catch (error) {
            console.error("Error in groupinfo command:", error)
            await sock.sendMessage(groupJid, { text: "⚠ Failed to fetch group information." })
        }
    }
}
