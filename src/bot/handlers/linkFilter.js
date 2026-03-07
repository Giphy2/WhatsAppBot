// src/bot/handlers/linkFilter.js
// Handles link detection, whitelist checking, and link warnings

const supabase = require("../../config/supabaseClient.js");

/**
 * Extract all URLs from a message text
 * Supports common URL formats (http, https, www, etc.)
 */
function extractLinks(text) {
  if (!text) return [];

  // Regex pattern to match URLs
  const urlPattern = /(https?:\/\/|www\.)[^\s]+/gi;
  const matches = text.match(urlPattern) || [];

  // Clean up and normalize URLs
  return matches.map((url) => {
    // Remove trailing punctuation
    url = url.replace(/[.,;:!?()[\]{}]*$/, "");
    // Normalize www to https
    if (url.startsWith("www.")) {
      url = "https://" + url;
    }
    return url.toLowerCase();
  });
}

/**
 * Normalize URL for comparison (remove protocol, trailing slash, params)
 */
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Return domain + path (without protocol, query, hash)
    return (
      urlObj.hostname +
      (urlObj.pathname === "/" ? "" : urlObj.pathname)
    ).toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Check if a URL is whitelisted for a group
 */
async function isLinkAllowed(groupId, url) {
  try {
    const normalizedInput = normalizeUrl(url);

    const { data, error } = await supabase
      .from("allowed_links")
      .select("url")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error checking allowed links:", error);
      return null;
    }

    // Check if any whitelisted URL matches the provided URL
    if (data && data.length > 0) {
      for (const allowed of data) {
        const normalizedAllowed = normalizeUrl(allowed.url);
        if (normalizedInput === normalizedAllowed) {
          return true;
        }
        // Also check if the domain matches (for broader matching)
        if (
          normalizedInput.includes(new URL(allowed.url).hostname) ||
          normalizedAllowed.includes(new URL(url).hostname)
        ) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error("Error in isLinkAllowed:", err);
    return null;
  }
}

/**
 * Add a link to the whitelist for a group
 */
async function addAllowedLink(
  groupId,
  url,
  addedBy,
  description = ""
) {
  try {
    const normalizedUrl = normalizeUrl(url);

    const { data, error } = await supabase
      .from("allowed_links")
      .insert({
        group_id: groupId,
        url: url,
        added_by: addedBy,
        description: description,
      })
      .select();

    if (error) {
      if (error.code === "23505") {
        // Unique violation - link already exists
        return { success: false, message: "Link already whitelisted", exists: true };
      }
      console.error("Error adding allowed link:", error);
      return { success: false, message: error.message };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error("Error in addAllowedLink:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Remove a link from the whitelist
 */
async function removeAllowedLink(groupId, url) {
  try {
    const { data, error } = await supabase
      .from("allowed_links")
      .delete()
      .eq("group_id", groupId)
      .eq("url", url)
      .select();

    if (error) {
      console.error("Error removing allowed link:", error);
      return { success: false, message: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, message: "Link not found in whitelist" };
    }

    return { success: true, removed: true };
  } catch (err) {
    console.error("Error in removeAllowedLink:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Get all allowed links for a group
 */
async function getAllowedLinks(groupId) {
  try {
    const { data, error } = await supabase
      .from("allowed_links")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching allowed links:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getAllowedLinks:", err);
    return [];
  }
}

/**
 * Log a link warning (for statistics/audit trail)
 */
async function logLinkWarning(groupId, userId, linkSent, reason = "") {
  try {
    const { error } = await supabase.from("link_warnings").insert({
      group_id: groupId,
      user_id: userId,
      link_sent: linkSent,
      reason: reason,
    });

    if (error) {
      console.error("Error logging link warning:", error);
    }
  } catch (err) {
    console.error("Error in logLinkWarning:", err);
  }
}

/**
 * Check if message contains unapproved links
 * Returns { hasUnapprovedLinks, links[] }
 */
async function checkLinkApproval(groupId, message) {
  try {
    const links = extractLinks(message);

    if (links.length === 0) {
      return { hasUnapprovedLinks: false, links: [] };
    }

    const unapprovedLinks = [];

    for (const link of links) {
      const isAllowed = await isLinkAllowed(groupId, link);
      if (!isAllowed) {
        unapprovedLinks.push(link);
      }
    }

    return {
      hasUnapprovedLinks: unapprovedLinks.length > 0,
      links: unapprovedLinks,
    };
  } catch (err) {
    console.error("Error in checkLinkApproval:", err);
    return { hasUnapprovedLinks: false, links: [] };
  }
}

module.exports = {
  extractLinks,
  normalizeUrl,
  isLinkAllowed,
  addAllowedLink,
  removeAllowedLink,
  getAllowedLinks,
  logLinkWarning,
  checkLinkApproval,
};
