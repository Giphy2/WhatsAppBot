require("dotenv").config()
const startConnection = require("./src/bot/connection")
const { checkSupabaseConnection } = require("./src/bot/handlers/db")

async function main() {
    console.log("🚀 Starting WhatsApp Bot...")
    await checkSupabaseConnection()
    startConnection()
}

main()
