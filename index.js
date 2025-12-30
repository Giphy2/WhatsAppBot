require("dotenv").config()
const startConnection = require("./src/bot/connection")
const { checkSupabaseConnection } = require("./src/bot/handlers/db")

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000



app.get("/health", (req, res) => {
    res.status(200).send("OK")
})

const QRCode = require('qrcode')

let currentQR = null
let isConnected = false

app.get("/", async (req, res) => {
    if (isConnected) {
        return res.send(`
            <html>
                <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f0f2f5;">
                    <div style="text-align:center; padding:20px; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color:#00a884;">✅ Connected!</h1>
                        <p>The bot is running and connected to WhatsApp.</p>
                    </div>
                </body>
            </html>
        `)
    }

    if (currentQR) {
        try {
            const url = await QRCode.toDataURL(currentQR)
            return res.send(`
                <html>
                    <meta http-equiv="refresh" content="5">
                    <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f0f2f5;">
                        <div style="text-align:center; padding:20px; background:white; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                            <h1>📱 Scan Code</h1>
                            <p>Open WhatsApp > Settings > Linked Devices > Link a Device</p>
                            <img src="${url}" style="width:250px; height:250px;"/>
                            <p style="color:#666; font-size:12px;">Refreshes every 5 seconds</p>
                        </div>
                    </body>
                </html>
            `)
        } catch (err) {
            return res.send("Error generating QR")
        }
    }

    res.send(`
        <html>
            <meta http-equiv="refresh" content="2">
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f0f2f5;">
                <div style="text-align:center;">
                    <h1>⏳ Loading...</h1>
                    <p>Waiting for connection...</p>
                </div>
            </body>
        </html>
    `)
})

async function main() {
    console.log("🚀 Starting WhatsApp Bot...")

    // Start HTTP server for Render
    app.listen(PORT, () => {
        console.log(`🌍 HTTP Server running on port ${PORT}`)
    })

    await checkSupabaseConnection()

    startConnection((qr) => {
        currentQR = qr
        isConnected = false
    })
        .then(sock => {
            sock.ev.on('connection.update', (update) => {
                const { connection } = update
                if (connection === 'open') {
                    isConnected = true
                    currentQR = null
                }
            })
        })
}

main()
