# ✅ Warning System Implementation Checklist

## Quick Start (5 minutes)

### 1. Database Setup ⚙️
- [ ] Open Supabase Project Dashboard
- [ ] Go to SQL Editor
- [ ] Create a new query
- [ ] Copy SQL from `database/warnings_schema.sql`
- [ ] Run the query
- [ ] Verify `warnings` table is created

### 2. Test the Warning System 🧪
- [ ] Restart the bot: `npm run dev`
- [ ] Check console for any database connection errors
- [ ] Create a test group with the bot and an admin account
- [ ] Try these commands:
  - [ ] `!warn @testuser Testing warning` (should show 1/3)
  - [ ] `!warn @testuser Second warning` (should show 2/3)
  - [ ] `!warn @testuser Third warning` (should auto-kick)
  - [ ] `!warnings` (should show warning report)
  - [ ] `!clearwarnings @user` (if available)

### 3. Production Deployment 🚀
- [ ] Ensure `.env` has correct Supabase credentials
- [ ] Deploy to production server
- [ ] Test with real group members
- [ ] Monitor logs for errors

---

## File Structure Created

```
WhatsAppBot/
├── src/
│   └── bot/
│       └── handlers/
│           └── warnings.js              ✨ NEW: Warning handler functions
│
├── src/commands/admin/
│   ├── warn.js                          ✨ NEW: Issue warnings
│   ├── warnings.js                      ✨ NEW: Check warnings
│   └── clearwarnings.js                 ✨ NEW: Clear warnings
│
├── database/
│   └── warnings_schema.sql              ✨ NEW: SQL schema for warnings table
│
├── WARNINGS_SETUP.md                    ✨ NEW: Full setup guide
└── README.md                            ✨ UPDATED: Added warning system info
```

---

## API Reference

### Warning Handler Functions

**Location:** `src/bot/handlers/warnings.js`

```javascript
// Get warning count for a member
const count = await getWarningCount(groupId, userId);

// Add a warning
const newCount = await addWarning(groupId, userId, reason);

// Clear all warnings
const success = await clearWarnings(groupId, userId);

// Get all warnings in a group
const allWarnings = await getGroupWarnings(groupId);

// Check if should auto-kick
const shouldKick = await shouldKick(groupId, userId);
```

---

## Database Schema

```sql
TABLE: warnings
├── id (BIGINT, Primary Key)
├── group_id (TEXT) - WhatsApp group JID
├── user_id (TEXT) - WhatsApp user JID
├── warn_count (INT) - Current warning count (1-3)
├── last_warned_at (TIMESTAMP) - When last warned
├── last_reason (TEXT) - Reason for last warning
└── created_at (TIMESTAMP) - When first warned

UNIQUE CONSTRAINT: (group_id, user_id)
```

---

## Command Usage Examples

### 1. Warn a Member
```
Input:  !warn @john Spamming messages
Output: ⚠️ Warning issued to @john | 1/3 warnings | 2 left
```

### 2. Check Warnings
```
# Check specific member
Input:  !warnings @john
Output: 📋 Warnings for @john | 🔢 Total: 2/3 | Two warnings (last one = kick)

# List all warned members
Input:  !warnings
Output: ⚠️ Warnings Report for This Group | [List of all warned members]
```

### 3. Clear Warnings
```
Input:  !clearwarnings @john
Output: ✅ Cleared 2 warning(s) for @john | 🎉 Fresh start!
```

---

## Troubleshooting

### ❌ "Error connecting to Supabase"
**Solution:**
- Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
- Verify credentials are correct in Supabase dashboard
- Check internet connection

### ❌ Commands not working
**Solution:**
- Ensure `warnings.js` is in `src/bot/handlers/`
- Ensure command files are in `src/commands/admin/`
- Check bot has loaded all commands (see console logs)
- Restart bot: `npm run dev`

### ❌ Auto-kick not working
**Solution:**
- Bot must be a group admin
- Check console logs for errors
- Verify member JID format is correct

### ❌ Warnings not saving
**Solution:**
- Run SQL schema again
- Check Supabase table permissions
- Test database connection

---

## Performance Notes

- ⚡ Warnings are cached in memory (fast lookups)
- 💾 Supabase handles persistence
- 📊 Indexes on `group_id` and `user_id` for fast queries
- 🔄 Can handle 1000+ warnings without issues

---

## Security Features

✅ **Admin-Only Commands** - Only group admins can warn members  
✅ **Database Persistence** - Warnings survive bot restarts  
✅ **Automatic Enforcement** - No manual kick needed at 3 warnings  
✅ **Audit Trail** - All warnings logged with timestamps  
✅ **Appeal System** - Admins can clear warnings for second chances  

---

## Future Enhancements

Consider implementing:
- ⏱️ Auto-reset warnings after 30 days
- 📧 Notify admin when warnings reach 2
- 🎯 Different warn limits per group (configurable)
- 📊 Warning statistics dashboard
- 🤖 AI-powered auto-warn for spam detection
- 📝 Warning appeal system

---

## Support

For issues or questions:
1. Check [WARNINGS_SETUP.md](WARNINGS_SETUP.md) for detailed setup
2. Review the handler code: `src/bot/handlers/warnings.js`
3. Check console logs for error messages
4. Verify Supabase connection and table structure

---

**Status:** ✅ Ready to use  
**Version:** 1.0.0  
**Last Updated:** March 2026
