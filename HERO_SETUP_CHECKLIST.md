# Hero Media Setup Checklist ✓

## ✅ Already Done (By Your Code)

- [x] Supabase client configured (`.env` file)
- [x] API functions created (`fetchHeroMedia`, `saveHeroMedia`)
- [x] Trade page integrated with hero fetch
- [x] Shops page integrated with hero fetch
- [x] Video support with autoplay/loop/mute
- [x] Image support with background cover
- [x] Poster image support for videos
- [x] Responsive layout for all screen sizes
- [x] Gradient overlay for readability
- [x] Error handling and fallbacks
- [x] Auto-detection of media type from URL

## 📝 To-Do (Setup in Supabase)

### Step 1: Create Database Table
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Run the CREATE TABLE command
- [ ] Run the RLS policy commands
- [ ] Verify table created

### Step 2: Add Initial Data
- [ ] Insert sample hero for Trade page
- [ ] Insert sample hero for Shops page
- [ ] Verify data inserted

### Step 3: Test Connection
- [ ] Visit http://localhost:5173/trade
- [ ] Confirm hero background shows
- [ ] Visit http://localhost:5173/shops
- [ ] Confirm hero background shows

### Step 4: Upload Your Media (Optional)
- [ ] Create Storage bucket `hero-media`
- [ ] Set bucket to public
- [ ] Upload your images/videos
- [ ] Copy public URLs
- [ ] Update database with your URLs

## 🎯 Quick Commands

### Create Table
```sql
-- Copy from QUICK_HERO_COMMANDS.sql section 1️⃣
CREATE TABLE IF NOT EXISTS hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(50) NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  media_url TEXT NOT NULL,
  poster_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Add Sample Data
```sql
-- Copy from QUICK_HERO_COMMANDS.sql section 2️⃣
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES 
  ('trade', 'video', 'https://sample-video-url.mp4', TRUE),
  ('shops', 'image', 'https://sample-image-url.jpg', TRUE);
```

### Verify Setup
```sql
-- Should return 2 rows
SELECT * FROM hero_media WHERE is_active = TRUE;
```

## 📊 Expected Results

After setup, you should see:

### Trade Page (/trade)
```
┌─────────────────────────────────────┐
│  [Video/Image Background]           │
│  ┌───────────────────────────────┐  │
│  │ 🌾 Agricultural Trade Portal  │  │
│  │ Import & Export Marketplace   │  │
│  │ [+ Post Listing] [Browse ↓]   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Shops Page (/shops)
```
┌─────────────────────────────────────┐
│  [Video/Image Background]           │
│  ┌───────────────────────────────┐  │
│  │ 🧪 Agro-Chemical Directory    │  │
│  │ Find Trusted Suppliers        │  │
│  │ [Stats Bar]                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔍 Verification Steps

### 1. Check Database
```sql
-- Should return TRUE
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'hero_media'
);

-- Should return 2
SELECT COUNT(*) FROM hero_media WHERE is_active = TRUE;
```

### 2. Check Browser
- [ ] Open DevTools Console
- [ ] Look for any errors
- [ ] Check Network tab for API calls
- [ ] Verify media files load

### 3. Check Visual
- [ ] Hero section has background
- [ ] Text is readable (gradient overlay)
- [ ] Video plays automatically (if video)
- [ ] Image displays correctly (if image)
- [ ] Responsive on mobile

## ⚠️ Common Issues

### Issue: Hero not showing
**Solutions:**
- Check browser console for errors
- Verify table exists in Supabase
- Verify data exists and is_active = TRUE
- Check RLS policies are created
- Ensure media URL is public and accessible

### Issue: Video not playing
**Solutions:**
- Verify video format is MP4
- Check video URL is accessible
- Try a different video URL
- Check browser console for media errors
- Ensure video file size is reasonable (<5MB)

### Issue: Image not loading
**Solutions:**
- Verify image URL is accessible
- Check for CORS errors in console
- Try a different image URL
- Ensure image format is supported (JPG, PNG, WebP)

## 🎉 Success Criteria

You'll know it's working when:
- ✓ No errors in browser console
- ✓ Hero background displays on both pages
- ✓ Video plays automatically (if using video)
- ✓ Image displays clearly (if using image)
- ✓ Text overlay is readable
- ✓ Responsive on all screen sizes
- ✓ Fast page load times

## 📚 Documentation Reference

| File | When to Use |
|------|-------------|
| `QUICK_HERO_COMMANDS.sql` | Copy-paste daily commands |
| `HERO_MEDIA_SETUP.md` | Step-by-step setup guide |
| `HERO_CONNECTION_FLOW.md` | Understand architecture |
| `hero_media_sql.sql` | Complete SQL reference |
| `README_HERO_MEDIA.md` | Quick overview |

## 🚀 Next Steps After Setup

1. [ ] Upload your own media to Supabase Storage
2. [ ] Replace sample URLs with your own
3. [ ] Test on different devices
4. [ ] Optimize media file sizes
5. [ ] Add multiple hero options for rotation

## 💯 Progress Tracker

**Current Status:**
- Code Integration: ✅ 100% Complete
- Database Setup: ⏳ Waiting (you need to run SQL)
- Testing: ⏳ After database setup
- Production Ready: ⏳ After testing

**Estimated Time:**
- Database setup: 2 minutes
- Testing: 1 minute
- Total: 3 minutes

---

**Ready to start?** Open `QUICK_HERO_COMMANDS.sql` and copy section 1️⃣ into Supabase SQL Editor!
