# 🎬 Hero Media - Supabase Connection

## ✅ Status: READY TO USE

Your application is **already fully connected** to Supabase for hero media. You just need to create the database table!

## 📁 Files Created

| File | Purpose |
|------|---------|
| `hero_media_sql.sql` | Complete SQL documentation with all operations |
| `HERO_MEDIA_SETUP.md` | Step-by-step setup guide |
| `HERO_CONNECTION_FLOW.md` | Visual architecture and data flow |
| `QUICK_HERO_COMMANDS.sql` | Copy-paste SQL commands for daily use |

## 🚀 3-Minute Setup

### Step 1: Create Table (1 minute)
1. Open https://sufdhaxlabisrykwqkzm.supabase.co
2. Go to **SQL Editor**
3. Copy from `QUICK_HERO_COMMANDS.sql` section 1️⃣
4. Click **Run**

### Step 2: Add Sample Data (1 minute)
1. Copy from `QUICK_HERO_COMMANDS.sql` section 2️⃣
2. Click **Run**
3. Your hero media is now live!

### Step 3: Test (1 minute)
1. Visit http://localhost:5173/trade
2. Visit http://localhost:5173/shops
3. See hero backgrounds! 🎉

## 📋 What's Already Connected

```
✅ Supabase client configured
✅ API functions created (fetchHeroMedia, saveHeroMedia)
✅ Trade page fetches hero from DB
✅ Shops page fetches hero from DB
✅ Video support with poster
✅ Image support
✅ Responsive layouts
✅ Error handling
✅ Auto-detection of media type
```

## 🎯 Daily Usage

### View Current Hero Media
```sql
SELECT page, media_type, media_url 
FROM hero_media 
WHERE is_active = TRUE;
```

### Change Trade Page to Image
```sql
UPDATE hero_media SET is_active = FALSE WHERE page = 'trade';
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES ('trade', 'image', 'https://your-image-url.jpg', TRUE);
```

### Change Shops Page to Video
```sql
UPDATE hero_media SET is_active = FALSE WHERE page = 'shops';
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES ('shops', 'video', 'https://your-video.mp4', 'https://poster.jpg', TRUE);
```

## 📊 Database Schema

```sql
hero_media
├── id (UUID, primary key)
├── page (VARCHAR, 'trade' or 'shops')
├── media_type (VARCHAR, 'image' or 'video')
├── media_url (TEXT, required)
├── poster_url (TEXT, optional - for video thumbnail)
├── title (VARCHAR, optional)
├── subtitle (TEXT, optional)
├── badge_label (VARCHAR, optional)
├── is_active (BOOLEAN, default TRUE)
├── display_order (INTEGER, default 1)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## 🎨 Recommended Media Specs

### Images
- **Size**: 1920x600px (or larger)
- **Format**: JPG, PNG, WebP
- **File size**: Under 500KB
- **Aspect ratio**: 16:5 (wide banner)

### Videos
- **Resolution**: 1920x1080 or 1280x720
- **Format**: MP4 (H.264)
- **Duration**: 10-30 seconds (loops)
- **File size**: Under 5MB
- **FPS**: 30fps

## 🔐 Security (Already Configured)

- ✅ Row Level Security (RLS) enabled
- ✅ Public can read (SELECT)
- ✅ Authenticated users can write (INSERT/UPDATE/DELETE)
- ✅ Environment variables secured in `.env`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **HERO_MEDIA_SETUP.md** | Complete setup instructions with troubleshooting |
| **HERO_CONNECTION_FLOW.md** | Architecture diagrams and code flow |
| **hero_media_sql.sql** | Full SQL reference with all operations |
| **QUICK_HERO_COMMANDS.sql** | Quick copy-paste commands for daily use |

## 🎬 How It Works

```
User visits /trade
    ↓
Trade.jsx fetches: fetchHeroMedia('trade')
    ↓
api.js queries Supabase: SELECT * FROM hero_media WHERE page='trade'
    ↓
Supabase returns media data
    ↓
Component renders <video> or <img>
    ↓
Hero displays with background!
```

## 💡 Quick Tips

1. **Use Table Editor** in Supabase for easy updates
2. **Test with sample URLs** before uploading your own media
3. **Only one active hero per page** (others are automatically hidden)
4. **Changes are instant** - refresh page to see updates
5. **Use Supabase Storage** for hosting your media files

## 🆘 Need Help?

### Hero not showing?
1. Check browser console for errors
2. Run: `SELECT * FROM hero_media WHERE is_active = TRUE;`
3. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'hero_media';`
4. Check media URL is accessible

### Video not playing?
1. Verify format is MP4
2. Check URL is public and accessible
3. Try a different video URL
4. Check browser console for media errors

## 🎉 You're All Set!

Just run the SQL to create the table and you're done. Everything else is already connected!

---

**Questions?** Check the detailed guides in the other files.
