// src/commands/admin/warn.js
// Warn a member (3 warnings = auto kick)

const { addWarning, getWarningCount, shouldKick } = require("../../bot/handlers/warnings");

module.exports = {
  name: "warn",
  description: "Warn a member (3 warnings = auto kick)",
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
        { text: "❌ Please mention a member to warn!\n\nUsage: !warn @member [reason]" },
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
          { text: "❌ You must be an admin to warn members." },
          { quoted: msg }
        );
      }

      const targetUserId = mentions[0];
      const reason = args.slice(1).join(" ") || "No reason provided";

      // Add warning
      const newWarningCount = await addWarning(groupJid, targetUserId, reason);

      if (newWarningCount === null) {
        return await sock.sendMessage(
          groupJid,
          { text: "⚠️ Error while adding warning. Please try again." },
          { quoted: msg }
        );
      }

      // Check if should kick
      if (newWarningCount >= 3) {
        // Auto-kick the member
        await sock.groupParticipantsUpdate(groupJid, [targetUserId], "remove");

        await sock.sendMessage(
          groupJid,
          {
            text: `⛔ @${targetUserId.split("@")[0]} has been kicked!\n\n📊 Reason: Reached 3 warnings\n⚠️ Final Warning: ${reason}`,
            mentions: [targetUserId],
          },
          { quoted: msg }
        );
      } else {
        const warningsLeft = 3 - newWarningCount;
        const warningMessage = `⚠️ Warning issued to @${targetUserId.split("@")[0]}\n\n📊 Warning: ${newWarningCount}/3\n⏳ Warnings left: ${warningsLeft}\n💭 Reason: ${reason}`;

        await sock.sendMessage(
          groupJid,
          {
            text: warningMessage,
            mentions: [targetUserId],
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error("Error in warn command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while warning the member." },
        { quoted: msg }
      );
    }
  },
};
