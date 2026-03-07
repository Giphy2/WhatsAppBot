// src/commands/admin/addlink.js
// Add a link to the group's whitelist

const { addAllowedLink } = require("../../bot/handlers/linkFilter");

module.exports = {
  name: "addlink",
  description: "Add a link to the whitelist (allowed links)",
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
          text: "❌ Please provide a link to add!\n\n📝 Usage:\n!addlink <URL> [description]\n\nExample:\n!addlink https://youtube.com YouTube official\n!addlink www.google.com",
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

      const url = args[0];
      const description = args.slice(1).join(" ") || "";

      // Validate URL format
      if (!url.includes(".") || (!url.startsWith("http") && !url.startsWith("www"))) {
        return await sock.sendMessage(
          groupJid,
          {
            text: "❌ Invalid URL format.\n\n✅ Valid formats:\nhttps://example.com\nwww.example.com\nhttp://example.com",
          },
          { quoted: msg }
        );
      }

      // Add link to whitelist
      const result = await addAllowedLink(
        groupJid,
        url,
        senderId,
        description
      );

      if (!result.success) {
        if (result.exists) {
          return await sock.sendMessage(
            groupJid,
            {
              text: `⚠️ This link is already whitelisted!\n\n🔗 Link: ${url}`,
            },
            { quoted: msg }
          );
        }
        return await sock.sendMessage(
          groupJid,
          { text: `❌ Error adding link: ${result.message}` },
          { quoted: msg }
        );
      }

      const responseText =
        `✅ Link added to whitelist!\n\n` +
        `🔗 URL: ${url}\n` +
        (description ? `📝 Description: ${description}\n` : "") +
        `👤 Added by: @${senderId.split("@")[0]}\n` +
        `📅 All links in group are now safe`;

      await sock.sendMessage(
        groupJid,
        {
          text: responseText,
          mentions: [senderId],
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error in addlink command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while adding the link." },
        { quoted: msg }
      );
    }
  },
};
