// src/bot/handlers/warnings.js
// Manages member warnings system with 3-strike auto-kick

const supabase = require("../../config/supabaseClient.js");
const { getGroupSettings } = require("./db.js");

/**
 * Get warning count for a member
 */
async function getWarningCount(groupId, userId) {
  try {
    const { data, error } = await supabase
      .from("warnings")
      .select("warn_count")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // No warnings found
      return 0;
    }

    if (error) {
      console.error("Error fetching warning count:", error);
      return null;
    }

    return data?.warn_count || 0;
  } catch (err) {
    console.error("Error in getWarningCount:", err);
    return null;
  }
}

/**
 * Add a warning to a member
 * Returns the new warning count or null on error
 */
async function addWarning(groupId, userId, reason = "No reason provided") {
  try {
    const currentWarnings = await getWarningCount(groupId, userId);

    if (currentWarnings === null) {
      console.error("Could not fetch current warnings");
      return null;
    }

    const newWarnings = currentWarnings + 1;

    // Upsert: if exists, update; if not, insert
    const { data, error } = await supabase
      .from("warnings")
      .upsert(
        {
          group_id: groupId,
          user_id: userId,
          warn_count: newWarnings,
          last_warned_at: new Date().toISOString(),
          last_reason: reason,
        },
        { onConflict: "group_id,user_id" }
      )
      .select();

    if (error) {
      console.error("Error adding warning:", error);
      return null;
    }

    return newWarnings;
  } catch (err) {
    console.error("Error in addWarning:", err);
    return null;
  }
}

/**
 * Clear all warnings for a member
 */
async function clearWarnings(groupId, userId) {
  try {
    const { error } = await supabase
      .from("warnings")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing warnings:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in clearWarnings:", err);
    return false;
  }
}

/**
 * Get all warnings in a group
 */
async function getGroupWarnings(groupId) {
  try {
    const { data, error } = await supabase
      .from("warnings")
      .select("*")
      .eq("group_id", groupId)
      .order("warn_count", { ascending: false });

    if (error) {
      console.error("Error fetching group warnings:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getGroupWarnings:", err);
    return [];
  }
}

/**
 * Check if member should be kicked (reached 3 warnings)
 */
async function shouldKick(groupId, userId) {
  const warnings = await getWarningCount(groupId, userId);
  return warnings >= 3;
}

module.exports = {
  getWarningCount,
  addWarning,
  clearWarnings,
  getGroupWarnings,
  shouldKick,
};
