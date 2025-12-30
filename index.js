require("dotenv").config()
const startConnection = require("./src/bot/connection")
const { checkSupabaseConnection } = require("./src/bot/handlers/db")

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("WhatsApp Bot is running! 🚀")
})

app.get("/health", (req, res) => {
    res.status(200).send("OK")
})

async function main() {
    console.log("🚀 Starting WhatsApp Bot...")
    
    // Start HTTP server for Render
    app.listen(PORT, () => {
        console.log(`🌍 HTTP Server running on port ${PORT}`)
    })

    await checkSupabaseConnection()
    startConnection()
}

main()
