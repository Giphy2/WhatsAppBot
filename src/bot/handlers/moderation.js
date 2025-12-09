const { getGroupSettings, addWarning } = require("./db")

const linkRegex = /(https?:\/\/[^\s]+)/gi
const badWords = ["badword1", "badword2"] // add more

async function checkMessage(sock, msg) {
    const sender = msg.key.remoteJid
    if (!sender.endsWith("@g.us")) return

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ""

    if (!text) return

    const groupSettings = await getGroupSettings(sender)

    // Anti-Link
    if (groupSettings.antiLink && linkRegex.test(text)) {
        const warnCount = await addWarning(sender, msg.key.participant)
        await sock.sendMessage(sender, { text: `⚠️ Link detected! Warning ${warnCount}/${groupSettings.warnLimit}` })

        if (warnCount >= groupSettings.warnLimit) {
            // Kick user after reaching warning limit
            await sock.groupParticipantsUpdate(sender, [msg.key.participant], "remove")
            await sock.sendMessage(sender, { text: `❌ ${msg.key.participant.split("@")[0]} has been removed for repeated violations.` })
        }
        return true
    }

    // Anti-Bad Word
    if (groupSettings.antiBadWord && badWords.some(word => text.toLowerCase().includes(word))) {
        const warnCount = await addWarning(sender, msg.key.participant)
        await sock.sendMessage(sender, { text: `⚠️ Bad word detected! Warning ${warnCount}/${groupSettings.warnLimit}` })

        if (warnCount >= groupSettings.warnLimit) {
            await sock.groupParticipantsUpdate(sender, [msg.key.participant], "remove")
            await sock.sendMessage(sender, { text: `❌ ${msg.key.participant.split("@")[0]} has been removed for repeated violations.` })
        }
        return true
    }

    return false
}

module.exports = { checkMessage }
