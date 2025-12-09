const fs = require("fs")
const path = require("path")

// Load commands into a map
function loadCommands() {
    const commands = new Map()

    const commandFolders = fs.readdirSync(path.join(__dirname, "../../commands"))

    for (const folder of commandFolders) {
        const commandFiles = fs
            .readdirSync(path.join(__dirname, `../../commands/${folder}`))
            .filter(file => file.endsWith(".js"))

        for (const file of commandFiles) {
            const command = require(`../../commands/${folder}/${file}`)
            if (command.name) {
                commands.set(command.name, { ...command, category: folder })
            }
        }
    }

    return commands
}

module.exports = loadCommands
