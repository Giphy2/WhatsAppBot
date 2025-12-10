const axios = require("axios");

module.exports = {
  name: "chat",
  category: "dm",
  description: "Chat with the AI.",
  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
      await sock.sendMessage(sender, { text: "Please provide a message to the AI." });
      return;
    }

    try {
      // AI logic will go here
      const response = `Echo: ${text}`; // Placeholder response
      await sock.sendMessage(sender, { text: response });
    } catch (error) {
      console.error("Error calling AI:", error);
      await sock.sendMessage(sender, { text: "Sorry, I couldn't get a response from the AI." });
    }
  },
};
