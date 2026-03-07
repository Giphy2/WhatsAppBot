// src/commands/admin/allowedlinks.js
// View all whitelisted links for the group

const { getAllowedLinks } = require("../../bot/handlers/linkFilter");

module.exports = {
  name: "allowedlinks",
  description: "View all whitelisted links for this group",
  category: "admin",
  async execute(sock, msg, args) {
    const groupJid = msg.key.remoteJid;

    // Check if it's a group
    if (!groupJid.endsWith("@g.us")) {
      return await sock.sendMessage(groupJid, {
        text: "❌ This command can only be used in groups.",
      });
    }

    try {
      // Get all allowed links
      const allowedLinks = await getAllowedLinks(groupJid);

      if (allowedLinks.length === 0) {
        return await sock.sendMessage(
          groupJid,
          {
            text: "📋 **Whitelisted Links**\n\n❌ No links whitelisted yet.\n\n💡 Add links using: !addlink <URL>\n\n⚠️ Note: When no links are whitelisted, ALL links will trigger warnings.",
          },
          { quoted: msg }
        );
      }

      let linksList = "📋 **Whitelisted Links for This Group**\n\n";
      linksList += `Total: ${allowedLinks.length} link(s)\n\n`;

      allowedLinks.forEach((link, index) => {
        linksList += `${index + 1}. 🔗 ${link.url}\n`;
        if (link.description) {
          linksList += `   📝 ${link.description}\n`;
        }
        linksList += `   👤 Added by: @${link.added_by.split("@")[0]}\n`;
        linksList += `   📅 ${new Date(link.created_at).toLocaleDateString()}\n\n`;
      });

      linksList += `\n💡 Commands:\n!addlink <URL> - Add a link\n!removelink <URL> - Remove a link`;

      const mentions = allowedLinks
        .map((link) => link.added_by)
        .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

      await sock.sendMessage(
        groupJid,
        {
          text: linksList,
          mentions: mentions,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("Error in allowedlinks command:", err);
      await sock.sendMessage(
        groupJid,
        { text: "❌ An error occurred while fetching whitelisted links." },
        { quoted: msg }
      );
    }
  },
};
