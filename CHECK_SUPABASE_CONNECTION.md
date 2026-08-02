# Supabase Connection Troubleshooting Guide

## Steps to Fix "Image Not Working" Issue

### 1. Check if `hero_media` table exists
In Supabase Dashboard:
- Go to **Table Editor**
- Look for `hero_media` table
- If it doesn't exist, run the SQL from `hero_media_sql.sql`

### 2. Enable Row Level Security (RLS) - IMPORTANT!
```sql
-- Allow anonymous users to read hero_media
CREATE POLICY "Enable read access for all users"
ON hero_media FOR SELECT
TO anon
USING (true);
```

### 3. Insert test data
Run the SQL from `FEED_HERO_TEST.sql` in Supabase SQL Editor

### 4. Test the connection
Open browser console (F12) and look for:
- ✅ "Hero media loaded: {data...}" = Working!
- ❌ "Error fetching hero media" = Check RLS policies
- ℹ️ "No active hero media found" = Need to insert data

### 5. Common Issues

**401 Unauthorized Error:**
- Missing RLS policy
- Run the policy SQL above

**No data showing:**
- Check `is_active = true` in your row
- Check `page = 'feed'` matches exactly

**Image not displaying:**
- Check the `media_url` is accessible
- Try the test URL from FEED_HERO_TEST.sql
- Make sure `media_type = 'image'`

### 6. Quick Test Query
Run this in Supabase SQL Editor:
```sql
SELECT * FROM hero_media 
WHERE page = 'feed' 
AND is_active = true;
```

Should return 1 row if properly configured.
