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

module.exports = { handleGroupUpdate }
