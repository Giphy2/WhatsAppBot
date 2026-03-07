// src/commands/admin/warnings.js
// Check warnings for a specific member or list all

const { getWarningCount, getGroupWarnings } = require("../../bot/handlers/warnings");

module.exports = {
  name: "warnings",
  description: "Check member warnings or list all warnings in group",
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

    try {
      // Check if sender is an admin
      const groupMetadata = await sock.groupMetadata(groupJid);
      const admins = groupMetadata.participants
        .filter((p) => p.admin)
        .map((p) => p.id);

      if (!admins.includes(senderId)) {
        return await sock.sendMessage(
          groupJid,
          { text: "❌ You must be an admin to check warnings." },
          { quoted: msg }
        );
      }

      // If member mentioned, show their warnings
      const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

      if (mentions && mentions.length > 0) {
        const targetUserId = mentions[0];
        const warningCount = await getWarningCount(groupJid, targetUserId);

        if (warningCount === null) {
          return await sock.sendMessage(
            groupJid,
            { text: "⚠️ Error checking warnings. Please try again." },
            { quoted: msg }
          );
        }

        const status =
          warningCount === 0
            ? "✅ Clean record"
            : warningCount === 1
            ? "⚠️ One warning"
            : warningCount === 2
            ? "⚠️⚠️ Two warnings (last one = kick)"
            : "🔴 THREE WARNINGS - BANNED";

        const warningText = `📋 Warnings for @${targetUserId.split("@")[0]}\n\n🔢 Total Warnings: ${warningCount}/3\n${status}`;

        return await sock.sendMessage(
          groupJid,
          {
            text: warningText,
            mentions: [targetUserId],
          },
          { quoted: msg }
        );
      }

      // If no mention, show all warned members
      const allWarnings = await getGroupWarnings(groupJid);

      if (allWarnings.length === 0) {
        return await sock.sendMessage(
          groupJid,
          { text: "✅ No warnings in this group! Everyone is on good behavior." },
          { quoted: msg }
        );
      }

      let warningsList = "⚠️ **Warnings Report for This Group**\n\n";
      warningsList += allWarnings
        .map(
          (warn, index) =>
            `${index + 1}. @${warn.user_id.split("@")[0]}\n   📊 Warnings: ${warn.warn_count}/3\n   📅 Last warned: ${new Date(warn.last_warned_at).toLocaleDateString()}\n   💭 Reason: ${warn.last_reason || "N/A"}\n`
        )
        .join("\n");

      const mentions = allWarnings.map((w) => w.user_id);

      await sock.sendMessage(
        groupJid,
        {
          text: warningsList,
          mentions: mentions,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error in warnings command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while fetching warnings." },
        { quoted: msg }
      );
    }
  },
};
