# WhatsApp Bot

A powerful, feature-rich WhatsApp bot built with Node.js using [Baileys](https://github.com/WhiskeySockets/Baileys) library. This bot supports AI-powered conversations, group management, utility commands, and more.

## 🌟 Features

### Core Capabilities
- **WhatsApp Web Automation** - Connect via WhatsApp Web using QR code scanning
- **AI Integration** - Multi-provider AI fallback system (OpenAI → Google Gemini → Hugging Face)
- **Command System** - Modular command architecture with category-based organization
- **Group Management** - Admin commands for group control and moderation
- **User Management** - Direct message support with personalized responses
- **Database Integration** - Supabase support for persistent data storage
- **Warning System** - 3-strike auto-kick system to manage member behavior
- **Link Whitelist** - Auto-detect and filter unapproved links with admin control

### Command Categories

#### 🤖 DM Commands (Direct Messages)
- **chat** - Chat with the AI assistant
- **feedback** - Send feedback to the bot owner
- **help** - Get help and command information
- **info** - Bot information and statistics
- **joke** - Get a random joke
- **ping** - Check bot latency and status
- **quote** - Get an inspirational quote
- **support** - Get support and contact information

#### 👥 Admin Commands (Group Only)
- **add** - Add a member to the group
- **kick** - Remove a member from the group
- **lock** - Lock group messages (admin only)
- **unlock** - Unlock group messages
- **tagall** - Tag all members in the group
- **warn** - Issue a warning to a member (3 strikes = auto-kick)
- **warnings** - Check warnings for a member or list all
- **clearwarnings** - Clear all warnings for a member
- **addlink** - Add a link to the group's whitelist
- **removelink** - Remove a link from the whitelist
- **allowedlinks** - View all whitelisted links

#### 🎮 General Commands
- **dice** - Roll a dice (1-6)
- **flip** - Flip a coin (heads/tails)
- **ping** - Check response time
- **groupinfo** - Get group information

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- WhatsApp account
- API keys for AI services (optional, but recommended):
  - OpenAI API key (recommended for best results)
  - Google Generative AI key (fallback option)
- Supabase account (optional, for database features)

## 🚀 Installation

### 1. Clone/Setup the Repository
```bash
cd /home/albert/Documents/WhatsAppBot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp src/config/env.example .env
```

Edit `.env` with your settings:
```env
# WhatsApp Bot Configuration
BOT_PREFIX=!
BOT_OWNER=YOUR_PHONE_NUMBER@s.whatsapp.net
PORT=3000

# AI Service Keys (choose at least one)
OPENAI_API_KEY=your_openai_key
GOOGLE_GENAI_API_KEY=your_google_gemini_key
OPENAI_MODEL=gpt-3.5-turbo

# Database (Optional)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Optional
USE_GEMINI=false
MONGO_URI=your_mongo_uri
```

## 📱 Running the Bot

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### First Connection
1. The bot will start and display a QR code in the terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code displayed in your terminal
5. The bot will connect automatically

### Web Interface
- Open your browser and go to `http://localhost:3000`
- When disconnected, you'll see the QR code to scan
- When connected, you'll see a confirmation message

## 📁 Project Structure

```
WhatsAppBot/
├── index.js                          # Entry point & Express server
├── package.json                      # Dependencies & scripts
├── nodemon.json                      # Nodemon configuration
├── .env                              # Environment variables (create from env.example)
│
├── src/
│   ├── bot/
│   │   ├── connection.js            # WhatsApp connection setup
│   │   ├── handlers/
│   │   │   ├── ai.js                # AI response handler (multi-provider fallback)
│   │   │   ├── commandHandler.js    # Command loader & executor
│   │   │   ├── db.js                # Database operations
│   │   │   ├── dmHandler.js         # Direct message handler
│   │   │   ├── groupHandler.js      # Group message handler
│   │   │   ├── messageHandler.js    # Message processing
│   │   │   └── moderation.js        # Message filtering & moderation
│   │   └── utils/
│   │       ├── helpers.js           # Utility functions
│   │       └── logger.js            # Logging utilities
│   │
│   ├── commands/
│   │   ├── admin/                   # Group admin commands
│   │   │   ├── add.js
│   │   │   ├── kick.js
│   │   │   ├── lock.js
│   │   │   ├── tagall.js
│   │   │   └── unlock.js
│   │   ├── dm/                      # Direct message commands
│   │   │   ├── chat.js
│   │   │   ├── feedback.js
│   │   │   ├── help.js
│   │   │   ├── info.js
│   │   │   ├── joke.js
│   │   │   ├── ping.js
│   │   │   ├── quote.js
│   │   │   └── support.js
│   │   └── general/                 # General commands
│   │       ├── dice.js
│   │       ├── flip.js
│   │       ├── groupinfo.js
│   │       └── ping.js
│   │
│   └── config/
│       ├── env.example              # Environment template
│       ├── settings.js              # Bot configuration
│       └── supabaseClient.js        # Supabase initialization
│
├── tools/
│   └── list_models.js               # Utility to list available AI models
│
└── auth/                            # WhatsApp session data (auto-generated)
```

## 🏗️ Architecture Overview

### Connection Flow
```
index.js (Express Server)
  └─→ startConnection()
      ├─→ Load WhatsApp auth state
      ├─→ Scan QR code
      └─→ Initialize socket listeners
```

### Message Processing Flow
```
Incoming Message
  ↓
Connection Event
  ├─→ Direct Message → dmHandler
  │   └─→ Process command or AI chat
  │
  └─→ Group Message → groupHandler
      ├─→ Process command (if admin-only: check permissions)
      ├─→ Apply moderation rules
      └─→ Execute handler
```

### Command System
```
Raw Command → commandHandler.loadCommands()
  ├─→ Reads all files from commands/{category}/
  ├─→ Maps command by name
  └─→ Executes command.execute() with (sock, msg, args)
```

### AI Response Priority
```
User Message
  ↓
getAIResponse()
  ├─→ OpenAI (if key available) ✓ PRIMARY
  ├─→ Google Gemini (if enabled & key available)
  └─→ Local fallback response
```

## ⚠️ Warning System

The bot includes a **3-strike automatic warning system** for group management:

### How It Works
1. **1st Warning** → Member receives alert with reason
2. **2nd Warning** → Final alert before removal
3. **3rd Warning** → Member is **automatically kicked** from the group

### Commands
- `!warn @member [reason]` - Issue a warning
- `!warnings [@member]` - Check member warnings or list all warned members
- `!clearwarnings @member` - Clear warnings (give second chance)

### Example
```
Admin: !warn @spammer Excessive spam
Bot: ⚠️ Warning issued to @spammer | 1/3 warnings | 2 left

Admin: !warn @spammer Still spamming
Bot: ⚠️⚠️ Warning issued to @spammer | 2/3 warnings | 1 left

Admin: !warn @spammer Final warning
Bot: ⛔ @spammer has been kicked! | Reached 3 warnings
```

### Database Setup
To use the warning system, you need to set up the Supabase database:

1. Follow the setup guide: [WARNINGS_SETUP.md](WARNINGS_SETUP.md)
2. Run the SQL schema from `database/warnings_schema.sql`
3. The system is ready to use!

### Features
- ✅ Only group admins can issue warnings
- ✅ Warnings persist across bot restarts
- ✅ Admin can clear warnings for second chances
- ✅ View all warned members with reasons
- ✅ Automatic kick at 3 warnings

## � Link Whitelist System

The **Link Whitelist System** automatically detects and controls which external links can be shared in groups.

### How It Works
1. **Admin adds approved links** to the whitelist
2. **Bot detects all URLs** in messages
3. **Checks against whitelist**:
   - ✅ Approved links → Message passes
   - ❌ Unapproved links → Warning issued (integrates with warning system)
4. **3 unapproved link violations** = automatic kick

### Commands
- `!addlink <url> [description]` - Add a link to whitelist
- `!removelink <url>` - Remove a link from whitelist
- `!allowedlinks` - View all whitelisted links

### Example
```
Admin: !addlink https://github.com Our code repository
Bot: ✅ Link added to whitelist!

User: Check this out www.random-site.com
Bot: ⛔ Unapproved Link Alert | Warnings: 1/3 | 2 left

User: Visit https://github.com (whitelisted link)
Bot: ✅ Message posted (no warning)

Admin: !allowedlinks
Bot: [Shows all whitelisted links]
```

### Features
- ✅ Automatic URL detection and normalization
- ✅ Support for multiple URLs in one message
- ✅ Domain-based matching (www.example.com = example.com)
- ✅ Only admins can manage whitelist
- ✅ Integrates with 3-strike warning system
- ✅ Audit trail of all violations

### Database Setup
Follow [LINK_WHITELIST_SETUP.md](LINK_WHITELIST_SETUP.md) for detailed setup:
1. Run SQL schema from `database/link_whitelist_schema.sql`
2. Add approved links using `!addlink` command
3. System is ready to use!

## �🔧 Adding New Commands

### Command File Template
Create a new file in the appropriate category folder:

```javascript
// src/commands/{category}/{commandName}.js

module.exports = {
  name: "commandname",          // Command name (lowercase)
  description: "What it does",   // Short description
  category: "category",          // Category: admin, dm, or general
  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    
    try {
      // Your command logic here
      await sock.sendMessage(sender, { 
        text: "Response message" 
      });
    } catch (error) {
      console.error("Command error:", error);
    }
  },
};
```

### Key Objects

**sock** - WhatsApp socket connection
- Methods: `sendMessage()`, `groupMetadata()`, `groupParticipantsUpdate()`, etc.

**msg** - Received message object
- `msg.key.remoteJid` - Sender/group ID
- `msg.key.participant` - Participant ID (group messages)
- `msg.message.conversation` - Message text

**args** - Command arguments (array)

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_PREFIX` | No | Command prefix (default: `!`) |
| `BOT_OWNER` | Yes* | Bot owner's WhatsApp ID |
| `PORT` | No | Server port (default: 3000) |
| `OPENAI_API_KEY` | No* | OpenAI API key for GPT |
| `OPENAI_MODEL` | No | OpenAI model (default: gpt-3.5-turbo) |
| `GOOGLE_GENAI_API_KEY` | No* | Google Generative AI key |
| `USE_GEMINI` | No | Enable Gemini (false by default) |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_KEY` | No | Supabase API key |
| `MONGO_URI` | No | MongoDB connection string |

*At least one AI service key is recommended for the chat feature.

## 📊 Database Operations

The bot supports Supabase for storing user data and command logs:

```javascript
// Import database handler
const { checkSupabaseConnection } = require("./src/bot/handlers/db");

// Use in your commands for data persistence
```

## 🛡️ Security Notes

- Never commit `.env` file to version control
- Store sensitive keys in environment variables
- The bot uses Baileys for WhatsApp Web automation
- No official WhatsApp API is used
- WhatsApp accounts can be banned if suspicious activity is detected

## 🚨 Troubleshooting

### QR Code Not Showing
- Ensure terminal supports QR code display
- Check terminal width (minimum 50 chars recommended)
- Try accessing `http://localhost:3000` via browser

### Bot Not Responding
- Verify WhatsApp connection status
- Check that the prefix is correct
- Review command file syntax
- Check console logs for errors

### AI Not Working
- Verify API keys are set in `.env`
- Check API key validity and rate limits
- Review AI handler logs
- Ensure internet connection is stable

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| **@whiskeysockets/baileys** | WhatsApp Web automation |
| **@google/generative-ai** | Google Gemini AI |
| **openai** | OpenAI GPT integration |
| **@supabase/supabase-js** | Database operations |
| **express** | Web server framework |
| **dotenv** | Environment configuration |
| **chalk** | Terminal colors |
| **qrcode-terminal** | Terminal QR codes |
| **axios** | HTTP requests |
| **nodemon** | Development auto-reload |

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

Suggestions for enhancement:
- Add more AI models
- Implement message reactions
- Add image/media processing
- Create admin dashboard
- Add multi-language support
- Implement caching system

## ⚠️ Disclaimer

This bot uses WhatsApp Web automation. Use responsibly and comply with WhatsApp's Terms of Service. The developers are not responsible for any account bans or issues arising from improper use.

## 📄 License

ISC License

## 🔗 Resources

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** March 2026  
**Version:** 1.0.0
