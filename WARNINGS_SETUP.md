# ⚠️ Warning System Setup Guide

## Overview
This warning system tracks member violations with a 3-strike auto-kick mechanism:
- 1st warning: Alert issued
- 2nd warning: Final alert  
- 3rd warning: Auto-kick from group

## Database Setup

### Step 1: Create the Warnings Table
1. Go to your Supabase Project Dashboard
2. Click on **SQL Editor**
3. Create a new query
4. Copy the SQL from `database/warnings_schema.sql`
5. Run it
6. Verify the table is created

### Step 2: Verify Connection
Test that your `.env` has:
```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
```

## Available Commands

### 1. **!warn @member [reason]** (Admin Only)
Issue a warning to a group member
```
!warn @john Spamming memes
!warn @sarah Inappropriate language
```

**Response:**
- 1st warning: "⚠️ Warning issued to @john | 1/3 warnings | 2 left"
- 2nd warning: "⚠️⚠️ Warning issued to @john | 2/3 warnings | 1 left"
- 3rd warning: "⛔ @john has been kicked! | Reached 3 warnings"

### 2. **!warnings [@member]** (Admin Only)
Check warnings for a member or list all warned members
```
!warnings @john         # Check specific member
!warnings              # List all warned members in group
```

**Response Examples:**
```
📋 Warnings for @john
🔢 Total Warnings: 2/3
⚠️⚠️ Two warnings (last one = kick)
```

### 3. **!clearwarnings @member** (Admin Only)
Clear all warnings for a member (second chance)
```
!clearwarnings @john
```

**Response:**
```
✅ Cleared 2 warning(s) for @john
🎉 Fresh start! Make sure to follow the group rules.
```

## Data Structure

### Warnings Table
```
id                 | BIGINT (Primary Key, Auto-increment)
group_id           | TEXT (WhatsApp group JID)
user_id            | TEXT (WhatsApp user JID)
warn_count         | INT (1, 2, or 3)
last_warned_at     | TIMESTAMP (When last warned)
last_reason        | TEXT (Reason for last warning)
created_at         | TIMESTAMP (When first warned)
```

## ⚙️ How It Works

### Warning Flow
```
Member breaks rule
    ↓
!warn @member command
    ↓
Check if admin issuing warning
    ↓
Add warning to database
    ↓
Check warning count
    ├─→ Count = 1 or 2: Send warning message
    └─→ Count = 3: Auto-kick + notification
```

### Database Operations
1. **Add Warning** → Upsert operation (insert if new, increment if exists)
2. **Check Warnings** → Query by group_id + user_id
3. **Clear Warnings** → Delete record
4. **List All** → Query all warnings in group, sorted by count

## 🔒 Security Notes

- ✅ Only admins can issue warnings
- ✅ Only admins can check warnings
- ✅ Only admins can clear warnings
- ✅ Bot must be admin to kick members
- ✅ Records persist across bot restarts

## 📊 Example Usage Scenario

**Scenario:** John keeps spamming memes
```
Admin: !warn @john Excessive spamming
Bot: ⚠️ Warning issued to @john | 1/3 warnings | 2 left

[Later...]
Admin: !warn @john Still spamming
Bot: ⚠️⚠️ Warning issued to @john | 2/3 warnings | 1 left

[Later...]
Admin: !warn @john Final warning for spamming
Bot: ⛔ @john has been kicked! | Reached 3 warnings

[Admin changes mind]
Admin: !clearwarnings @john
Bot: ✅ Cleared 2 warning(s) for @john | 🎉 Fresh start!
```

## 🐛 Troubleshooting

### Warnings Not Saving
- ❌ Check Supabase connection in `.env`
- ❌ Verify `warnings` table exists
- ❌ Check database permissions

### Auto-Kick Not Working
- ❌ Bot must be a group admin
- ❌ Check console logs for errors
- ❌ Verify member JID is correct

### Command Not Recognized
- ❌ Ensure command files are in `src/commands/admin/`
- ❌ Check command name spelling
- ❌ Restart bot

## 📈 Future Enhancements

- ⏱️ Auto-reset warnings after 30 days
- 📧 Notify admin of frequent offenders
- 🎯 Different warn limits per group
- 📝 Warning appeal system
- 📊 Warning statistics dashboard

## 💾 Backup & Recovery

To backup warnings:
```sql
-- Export warnings
SELECT * FROM warnings ORDER BY created_at DESC;

-- Clear all warnings (use with caution!)
-- DELETE FROM warnings;

-- Reset specific group
-- DELETE FROM warnings WHERE group_id = 'your_group_id@g.us';
```

---

Need help? Check the handler file at `src/bot/handlers/warnings.js`
