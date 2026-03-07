// src/commands/admin/removelink.js
// Remove a link from the group's whitelist

const { removeAllowedLink } = require("../../bot/handlers/linkFilter");

module.exports = {
  name: "removelink",
  description: "Remove a link from the whitelist",
  category: "admin",
  async execute(sock, msg, args) {
    const groupJid = msg.key.remoteJid;
    const senderId = msg.key.participant;

    // Check if it's a group
    if (!groupJid.endsWith("@g.us")) {
      return await sock.sendMessage(groupJid, {
        text: "❌ This command can only be used in groups.",
      });
    }

    if (args.length === 0) {
      return await sock.sendMessage(
        groupJid,
        {
          text: "❌ Please provide a link to remove!\n\n📝 Usage:\n!removelink <URL>\n\nExample:\n!removelink https://youtube.com",
        },
        { quoted: msg }
      );
    }

    try {
      // Check if sender is an admin
      const groupMetadata = await sock.groupMetadata(groupJid);
      const admins = groupMetadata.participants
        .filter((p) => p.admin)
        .map((p) => p.id);

      if (!admins.includes(senderId)) {
        return await sock.sendMessage(
          groupJid,
          { text: "❌ You must be an admin to manage whitelisted links." },
          { quoted: msg }
        );
      }

      const url = args.join(" ");

      // Remove link from whitelist
      const result = await removeAllowedLink(groupJid, url);

      if (!result.success) {
        return await sock.sendMessage(
          groupJid,
          {
            text: `⚠️ ${result.message}\n\n🔗 Link: ${url}\n\n💡 Tip: Use !allowedlinks to see all whitelisted links`,
          },
          { quoted: msg }
        );
      }

      const responseText =
        `✅ Link removed from whitelist!\n\n` +
        `🔗 URL: ${url}\n` +
        `👤 Removed by: @${senderId.split("@")[0]}\n` +
        `⚠️ Sharing this link will now trigger a warning`;

      await sock.sendMessage(
        groupJid,
        {
          text: responseText,
          mentions: [senderId],
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error in removelink command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while removing the link." },
        { quoted: msg }
      );
    }
  },
};
