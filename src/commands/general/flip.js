module.exports = {
    name: "flip",
    description: "Flip a coin (heads/tails)",
    category: "general",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙"
        
        const flipText = `
🪙 *COIN FLIP*

Result: *${result}*

Flip again? Type \`!flip\`
        `.trim()

        await sock.sendMessage(sender, { text: flipText })
    }
}
