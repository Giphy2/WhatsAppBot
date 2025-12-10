const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "Success is not final, failure is not fatal. - Winston Churchill",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Don't let yesterday take up too much of today. - Will Rogers",
    "You learn more from failure than from success. - Unknown",
    "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The way to get started is to quit talking and begin doing. - Walt Disney"
]

module.exports = {
    name: "quote",
    description: "Get an inspirational quote",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        
        const quoteText = `
✨ *INSPIRATIONAL QUOTE*

"${randomQuote}"

Want another? Type \`!quote\` again!
        `.trim()

        await sock.sendMessage(sender, { text: quoteText })
    }
}
