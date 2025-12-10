const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "What do you call a fake noodle? An impasta!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What did one wall say to the other wall? I'll meet you at the corner!",
    "Why did the coffee file a police report? It got mugged!",
    "What's the best thing about Switzerland? I don't know, but their flag is a big plus!",
    "How do you organize a space party? You planet!",
    "Why did the tomato turn red? Because it saw the salad dressing!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why did the phone go to school? It wanted to get a little brighter!",
    "What do you call cheese that isn't yours? Nacho cheese!",
    "Why did the golf ball go to school? To improve its swing!",
    "What's orange and sounds like a parrot? A carrot!"
]

module.exports = {
    name: "joke",
    description: "Get a random joke",
    category: "dm",
    async execute(sock, msg, args) {
        const sender = msg.key.remoteJid
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
        
        const jokeText = `
😂 *RANDOM JOKE*

${randomJoke}

Want another? Type \`!joke\` again!
        `.trim()

        await sock.sendMessage(sender, { text: jokeText })
    }
}
