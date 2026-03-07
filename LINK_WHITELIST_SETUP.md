# 🔗 Link Whitelist System Setup Guide

## Overview

The **Link Whitelist System** automatically detects links shared in groups and checks them against an admin-approved whitelist. Messages with unapproved links trigger automatic warnings (3-strike system).

### How It Works
```
User sends message with link
    ↓
Bot extracts URLs from message
    ↓
Check if links are whitelisted
    ├─→ Approved: Message sent normally ✅
    └─→ Not approved: Issue warning ⚠️
         ├─ 1st warning: Alert user
         ├─ 2nd warning: Final alert
         └─ 3rd warning: Auto-kick 🔴
```

---

## Database Setup

### Step 1: Create Tables
1. Go to your Supabase Project Dashboard
2. Click on **SQL Editor**
3. Create a new query
4. Copy the SQL from `database/link_whitelist_schema.sql`
5. Run the query
6. Verify the tables are created:
   - `allowed_links` - Stores whitelisted URLs
   - `link_warnings` - Audit log of link violations

### Step 2: Verify Connection
Ensure your `.env` has:
```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
```

---

## Available Commands

### 1. **!addlink <url> [description]** (Admin Only)
Add a link to the group's whitelist
```
!addlink https://youtube.com YouTube official channel
!addlink www.github.com GitHub repository
!addlink https://bit.ly Short links
```

**Response:**
```
✅ Link added to whitelist!

🔗 URL: https://youtube.com
📝 Description: YouTube official channel
👤 Added by: @admin_name
📅 All links in group are now safe
```

### 2. **!removelink <url>** (Admin Only)
Remove a link from the whitelist
```
!removelink https://youtube.com
!removelink www.malicious-site.com
```

**Response:**
```
✅ Link removed from whitelist!

🔗 URL: https://youtube.com
👤 Removed by: @admin_name
⚠️ Sharing this link will now trigger a warning
```

### 3. **!allowedlinks** (Anyone)
View all whitelisted links for the group
```
!allowedlinks
```

**Response:**
```
📋 Whitelisted Links for This Group

Total: 5 link(s)

1. 🔗 https://youtube.com
   📝 YouTube official
   👤 Added by: @admin
   📅 3/7/2026

2. 🔗 www.github.com
   📝 Code repository
   👤 Added by: @admin
   📅 3/6/2026

[...]
```

---

## Link Detection Rules

### URL Formats Supported
✅ `https://example.com`  
✅ `www.example.com`  
✅ `http://example.com`  
✅ `https://example.com/page?param=value`  
✅ Shortened URLs (bit.ly, tinyurl, etc.)  

### What Works
- Detects multiple links in one message
- Normalizes URLs for comparison (domain matching)
- Handles URLs with subdomains
- Ignores trailing punctuation
- Case-insensitive matching

### Examples
```
Message: "Check out https://youtube.com"
Result: ✅ Approved (if whitelisted)

Message: "Bad site: www.malware.com"
Result: ⛔ Unapproved (warning issued)

Message: "See this: bit.ly/abc123 and youtube.com"
Result: ⛔ If bit.ly OR youtube.com not whitelisted
```

---

## Warning System Integration

When a user shares an unapproved link:

1. **First Violation:** ⚠️ Warning (1/3)
   ```
   ⛔ Unapproved Link Alert
   
   ❌ You shared a link that's not on the whitelist.
   
   🔗 Link(s) shared:
     • www.malware.com
   
   📋 Warnings: 1/3
   ⏳ 2 warning(s) left before removal
   ```

2. **Second Violation:** ⚠️⚠️ Warning (2/3)
   ```
   ⛔ Unapproved Link Alert
   
   ❌ You shared a link that's not on the whitelist.
   
   🔗 Link(s) shared:
     • www.phishing.com
   
   📋 Warnings: 2/3
   ⏳ 1 warning(s) left before removal
   ```

3. **Third Violation:** 🔴 Auto-Kicked
   ```
   ⛔ Auto-Kicked for Unapproved Links
   
   You have been removed from the group for sharing unapproved links.
   ```

---

## Configuration

### Database Tables

**allowed_links**
```
id              - Unique identifier
group_id        - WhatsApp group JID
url             - Whitelisted URL
added_by        - Admin who added it
description     - Optional reason/description
created_at      - When link was added
updated_at      - Last updated
```

**link_warnings**
```
id              - Unique identifier
group_id        - WhatsApp group JID
user_id         - Member who shared link
link_sent       - The unapproved URL shared
warned_at       - When warning was issued
reason          - Reason for warning
```

---

## Example Usage Scenario

### Scenario 1: Adding Approved Links
```
Admin: !addlink https://github.com Our code repo
Bot: ✅ Link added to whitelist!

Admin: !addlink www.slack.com Team communication
Bot: ✅ Link added to whitelist!

Admin: !allowedlinks
Bot: [Shows both links in list]
```

### Scenario 2: Detecting Unapproved Links
```
User: Check this out: www.random-spam.com
Bot: ⛔ Unapproved Link Alert | Warnings: 1/3 | 2 left

User: www.random-spam.com is actually good!
Bot: ⛔ Unapproved Link Alert | Warnings: 2/3 | 1 left

User: One more time: www.random-spam.com
Bot: ⛔ Auto-Kicked for Unapproved Links
[User is removed from group]
```

### Scenario 3: Managing Whitelist
```
Admin: I made a mistake, let me remove that link
Admin: !removelink www.old-link.com
Bot: ✅ Link removed from whitelist!

Admin: !allowedlinks
Bot: [Shows updated list without removed link]
```

---

## Advanced Features

### Batch URL Filtering
If a message contains multiple links:
- ✅ ALL approved → Message allowed
- ❌ ANY unapproved → Warning issued for entire message
- Message is blocked until corrected

### Domain Matching
The system matches:
- Exact URLs: `youtube.com` ≠ `www.youtube.com` (normalized)
- Subdomains: `www.github.com` = `github.com` (parent domain)
- Paths: `example.com/page1` ≈ `example.com/page2`

### URL Normalization
Converts URLs to standard format:
```
Input:  WWW.GITHUB.COM
Output: github.com

Input:  https://github.com/
Output: github.com

Input:  example.com?param=abc#section
Output: example.com/ (without query/hash)
```

---

## Troubleshooting

### ❌ Links always trigger warnings
**Possible causes:**
1. `allowed_links` table doesn't exist → Run SQL schema
2. No links whitelisted → Use `!addlink` to add approved links
3. Database connection issue → Check `.env` credentials

**Solution:**
```
1. Create the tables: database/link_whitelist_schema.sql
2. Add some approved links: !addlink <url>
3. Test: Share an approved link (should pass)
```

### ❌ Bot can't detect links
**Possible causes:**
1. Link format not supported
2. Message not extracted properly

**Solution:**
```
Supported formats:
✅ https://example.com
✅ www.example.com
❌ example.com (without www/https)
```

### ❌ Auto-kick not working
**Possible causes:**
1. Bot is not a group admin
2. Database connection lost
3. Warning count not tracking

**Solution:**
```
1. Restart bot
2. Check bot is admin in group
3. Verify database tables exist
4. Check console logs for errors
```

---

## Security Notes

✅ **Only admins can manage whitelist**  
✅ **Warnings linked to warning system** (3 strikes = auto-kick)  
✅ **URLs are normalized** for consistent comparison  
✅ **Database persistence** survives bot restarts  
✅ **Audit trail** of all link violations  

---

## Performance

- ⚡ Fast URL detection (regex-based)
- 💾 Efficient database lookups (indexed by group_id)
- 📊 Can handle 1000+ links per group
- 🔄 No rate limiting needed

---

## Future Enhancements

Consider implementing:
- 🎯 Whitelist templates (pre-approved lists)
- 🔍 Auto-blacklist harmful sites
- 📊 Link statistics dashboard
- 🤖 ML-based link categorization
- 🔔 Admin notifications on violations
- ⏱️ Temporary whitelist (expires after X days)

---

## Common Whitelist Examples

### For Developers
```
!addlink https://github.com GitHub code repository
!addlink https://stackoverflow.com Programming Q&A
!addlink https://npm.js.org NPM package registry
!addlink https://nodejs.org Node.js official
```

### For Communities
```
!addlink https://discord.com Discord server
!addlink https://youtube.com YouTube official
!addlink https://reddit.com Reddit community
```

### For Business
```
!addlink https://company-website.com Official website
!addlink https://docs.google.com Shared documents
!addlink https://zoom.us Video meetings
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review handler code: `src/bot/handlers/linkFilter.js`
3. Check console logs for errors
4. Verify Supabase tables structure

---

**Status:** ✅ Ready to use  
**Version:** 1.0.0  
**Last Updated:** March 2026
