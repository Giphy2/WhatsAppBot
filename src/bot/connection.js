/* src/bot/connection.js */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const chalk = require("chalk")
const qrcode = require("qrcode-terminal")
const fs = require("fs")

const loadCommands = require("./handlers/commandHandler")
const settings = require("../config/settings")
const { checkMessage } = require("./handlers/moderation")
const { handleDMMessage } = require("./handlers/dmHandler")
const { handleGroupMessage, handleGroupUpdate } = require("./handlers/groupHandler")

async function startConnection() {
  console.log(chalk.blue("⏳ Loading WhatsApp connection..."))

  // Load or create auth state
  const { state, saveCreds } = await useMultiFileAuthState("./auth")

  // Get latest WhatsApp protocol version
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    version,
    browser: ["MyGroupBot", "Chrome", "1.0.0"],
  })

  // Save session credentials
  sock.ev.on("creds.update", saveCreds)

  // QR Code Handler
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log(chalk.yellow("\n📱 Scan this QR to connect:\n"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      console.log(chalk.green("✅ WhatsApp Bot Connected Successfully!"))
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log(chalk.red("⚠ Connection closed: ", lastDisconnect?.error))

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow("🔄 Reconnecting..."))
        startConnection()
      } else {
        console.log(chalk.red("❌ Logged out. Please delete the auth folder and restart."))
      }
    }
  })

  const commands = loadCommands() // load all commands

  // Listen for incoming messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    // Only process new messages, not old ones from history
    if (type !== "notify") return

    for (const msg of messages) {
      console.log(`[DEBUG] Raw message received - fromMe: ${msg.key.fromMe}, hasMessage: ${!!msg.message}`)
      
      if (!msg.message) continue
      
      // Skip messages from the bot itself
      if (msg.key.fromMe) {
        console.log(`[DEBUG] Skipping message from self`)
        continue
      }
      
      // Run moderation first
      const blocked = await checkMessage(sock, msg)
      if (blocked) {
        console.log(`[MODERATION] Message from ${msg.key.remoteJid} blocked.`)
        continue
      }

      const sender = msg.key.remoteJid
      const isGroup = sender.endsWith("@g.us")

      // Route to appropriate handler
      if (isGroup) {
        await handleGroupMessage(sock, msg)
      } else {
        await handleDMMessage(sock, msg)
      }
    }
  })

  // Handle group updates (member added/removed)
  sock.ev.on("group-participants.update", (update) => {
    handleGroupUpdate(sock, update)
  })

  return sock
}

module.exports = startConnection
