# Hero Media Setup Guide

## 🚀 Quick Setup Instructions

Your hero media is **already connected** to Supabase! The code is ready - you just need to create the database table.

## ✅ What's Already Done

1. ✅ Supabase client configured (`.env` file has your credentials)
2. ✅ API functions created (`fetchHeroMedia` and `saveHeroMedia` in `src/lib/api.js`)
3. ✅ Trade page fetches hero media from Supabase
4. ✅ Shops page fetches hero media from Supabase
5. ✅ Both pages support video and image backgrounds

## 📋 What You Need To Do

### Step 1: Create the Database Table

1. Open your **Supabase Dashboard**: https://sufdhaxlabisrykwqkzm.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(50) NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  poster_url TEXT,
  title VARCHAR(255),
  subtitle TEXT,
  badge_label VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_media_page ON hero_media(page);
CREATE INDEX IF NOT EXISTS idx_hero_media_active ON hero_media(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_media_page_active ON hero_media(page, is_active);

ALTER TABLE hero_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
  ON hero_media 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated insert/update" 
  ON hero_media 
  FOR ALL 
  USING (auth.role() = 'authenticated');
```

5. Click **"Run"** (or press F5)

### Step 2: Add Sample Hero Media

Run this SQL to add test hero images:

```sql
-- Trade page hero (video example)
INSERT INTO hero_media (page, media_type, media_url, poster_url, title, subtitle, is_active)
VALUES (
  'trade',
  'video',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://picsum.photos/1920/600',
  'Global Trade',
  'Agricultural marketplace',
  TRUE
);

-- Shops page hero (image example)
INSERT INTO hero_media (page, media_type, media_url, title, subtitle, is_active)
VALUES (
  'shops',
  'image',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=600&fit=crop',
  'Find Suppliers',
  'Verified agro-chemical shops',
  TRUE
);
```

### Step 3: Upload Your Own Media (Optional)

To use your own images/videos:

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `hero-media` (make it **public**)
3. Upload your images/videos
4. Copy the public URL
5. Insert into database:

```sql
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES (
  'trade',
  'video',
  'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/hero-media/my-video.mp4',
  TRUE
);
```

## 🎬 How It Works

### Trade Page (`/trade`)
- Fetches hero media with `page = 'trade'`
- Displays video with poster OR image background
- Layered with gradient overlay and content on top

### Shops Page (`/shops`)
- Fetches hero media with `page = 'shops'`
- Displays video with poster OR image background
- Same layered structure

### Video Support
- Autoplay, loop, muted
- Poster image shown while loading
- Falls back gracefully if video fails

### Image Support
- Background cover with center positioning
- Responsive on all screen sizes

## 📊 Managing Hero Media

### View Current Hero Media

```sql
SELECT * FROM hero_media 
WHERE is_active = TRUE 
ORDER BY page, display_order;
```

### Change Trade Page Hero (to image)

```sql
-- Deactivate current
UPDATE hero_media SET is_active = FALSE WHERE page = 'trade';

-- Add new
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES ('trade', 'image', 'https://your-new-image-url.jpg', TRUE);
```

### Change Shops Page Hero (to video)

```sql
-- Deactivate current
UPDATE hero_media SET is_active = FALSE WHERE page = 'shops';

-- Add new
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES (
  'shops', 
  'video', 
  'https://your-video-url.mp4',
  'https://your-poster-url.jpg',
  TRUE
);
```

### Delete Hero Media

```sql
DELETE FROM hero_media WHERE id = 'uuid-here';
```

## 🎨 Recommended Specs

### Images
- **Resolution**: 1920x600px or larger
- **Format**: JPG, PNG, WebP
- **Size**: Under 500KB for fast loading
- **Aspect Ratio**: 16:5 (wide banner)

### Videos
- **Resolution**: 1920x1080 or 1280x720
- **Format**: MP4 (H.264 codec)
- **Duration**: 10-30 seconds (looping)
- **Size**: Under 5MB for fast loading
- **FPS**: 30fps

## 🔍 Testing

After setup, check:
1. Visit http://localhost:5173/trade
2. Visit http://localhost:5173/shops
3. You should see hero backgrounds!

## 🐛 Troubleshooting

**Hero not showing?**
- Check browser console for errors
- Verify table exists: `SELECT * FROM hero_media;`
- Verify data exists: `SELECT * FROM hero_media WHERE is_active = TRUE;`
- Check RLS policies are created
- Ensure media URLs are accessible (not blocked by CORS)

**Video not playing?**
- Check video URL is valid and accessible
- Verify video format is MP4
- Check browser console for media errors
- Try a different video URL

## 📚 Additional Resources

- Full SQL commands: `hero_media_sql.sql`
- API functions: `src/lib/api.js` (lines 417-477)
- Trade page: `src/pages/Trade.jsx` (lines 583-608)
- Shops page: `src/pages/Shops.jsx` (lines 284-321)

## ✨ That's It!

Your hero media is now fully connected to Supabase. Just create the table and add your media URLs!
