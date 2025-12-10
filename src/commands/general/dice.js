module.exports = {
    name: "dice",
    description: "Roll a dice (1-6)",
    category: "general",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        const diceRoll = Math.floor(Math.random() * 6) + 1
        
        const diceText = `
🎲 *DICE ROLL*

You rolled: *${diceRoll}* 🎲

Rolling again? Type \`!dice\`
        `.trim()

        await sock.sendMessage(sender, { text: diceText })
    }
}
