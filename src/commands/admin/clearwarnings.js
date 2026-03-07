// src/commands/admin/clearwarnings.js
// Clear warnings for a member (admin only)

const { clearWarnings, getWarningCount } = require("../../bot/handlers/warnings");

module.exports = {
  name: "clearwarnings",
  description: "Clear all warnings for a member",
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

    // Get mentions from the message
    const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentions || mentions.length === 0) {
      return await sock.sendMessage(
        groupJid,
        { text: "❌ Please mention a member to clear warnings!\n\nUsage: !clearwarnings @member" },
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
          { text: "❌ You must be an admin to clear warnings." },
          { quoted: msg }
        );
      }

      const targetUserId = mentions[0];
      const previousWarnings = await getWarningCount(groupJid, targetUserId);

      if (previousWarnings === null) {
        return await sock.sendMessage(
          groupJid,
          { text: "⚠️ Error checking warnings. Please try again." },
          { quoted: msg }
        );
      }

      if (previousWarnings === 0) {
        return await sock.sendMessage(
          groupJid,
          {
            text: `✅ @${targetUserId.split("@")[0]} has no warnings to clear.`,
            mentions: [targetUserId],
          },
          { quoted: msg }
        );
      }

      // Clear warnings
      const success = await clearWarnings(groupJid, targetUserId);

      if (!success) {
        return await sock.sendMessage(
          groupJid,
          { text: "⚠️ Error clearing warnings. Please try again." },
          { quoted: msg }
        );
      }

      await sock.sendMessage(
        groupJid,
        {
          text: `✅ Cleared ${previousWarnings} warning(s) for @${targetUserId.split("@")[0]}\n\n🎉 Fresh start! Make sure to follow the group rules.`,
          mentions: [targetUserId],
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error in clearwarnings command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while clearing warnings." },
        { quoted: msg }
      );
    }
  },
};
