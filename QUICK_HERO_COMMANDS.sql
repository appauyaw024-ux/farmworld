-- ============================================================
-- HERO MEDIA - QUICK REFERENCE COMMANDS
-- Copy & paste these into Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1️⃣  INITIAL SETUP (Run once)
-- ────────────────────────────────────────────────────────────

-- Create table with all features
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

CREATE INDEX idx_hero_media_page ON hero_media(page);
CREATE INDEX idx_hero_media_active ON hero_media(is_active);

-- Security policies
ALTER TABLE hero_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON hero_media 
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON hero_media 
FOR ALL USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────────────────────
-- 2️⃣  ADD SAMPLE DATA (Test immediately)
-- ────────────────────────────────────────────────────────────

-- Trade page - Sample video
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES (
  'trade',
  'video',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://picsum.photos/1920/600',
  TRUE
);

-- Shops page - Sample image
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES (
  'shops',
  'image',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=600&fit=crop',
  TRUE
);

-- ────────────────────────────────────────────────────────────
-- 3️⃣  VIEW CURRENT HERO MEDIA
-- ────────────────────────────────────────────────────────────

-- See all active hero media
SELECT 
  page, 
  media_type, 
  media_url, 
  poster_url,
  is_active,
  created_at
FROM hero_media 
WHERE is_active = TRUE 
ORDER BY page;

-- See everything (including inactive)
SELECT * FROM hero_media ORDER BY page, display_order;

-- ────────────────────────────────────────────────────────────
-- 4️⃣  CHANGE TRADE PAGE HERO
-- ────────────────────────────────────────────────────────────

-- Option A: To Image
-- Step 1: Deactivate current
UPDATE hero_media SET is_active = FALSE WHERE page = 'trade';

-- Step 2: Add new image
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES ('trade', 'image', 'https://YOUR-IMAGE-URL-HERE.jpg', TRUE);

-- Option B: To Video
-- Step 1: Deactivate current
UPDATE hero_media SET is_active = FALSE WHERE page = 'trade';

-- Step 2: Add new video with poster
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES (
  'trade', 
  'video', 
  'https://YOUR-VIDEO-URL-HERE.mp4',
  'https://YOUR-POSTER-URL-HERE.jpg',
  TRUE
);

-- ────────────────────────────────────────────────────────────
-- 5️⃣  CHANGE SHOPS PAGE HERO
-- ────────────────────────────────────────────────────────────

-- Option A: To Image
UPDATE hero_media SET is_active = FALSE WHERE page = 'shops';
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES ('shops', 'image', 'https://YOUR-IMAGE-URL-HERE.jpg', TRUE);

-- Option B: To Video
UPDATE hero_media SET is_active = FALSE WHERE page = 'shops';
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES (
  'shops', 
  'video', 
  'https://YOUR-VIDEO-URL-HERE.mp4',
  'https://YOUR-POSTER-URL-HERE.jpg',
  TRUE
);

-- ────────────────────────────────────────────────────────────
-- 6️⃣  UPDATE EXISTING HERO (without creating new)
-- ────────────────────────────────────────────────────────────

-- Update Trade page media URL
UPDATE hero_media 
SET 
  media_url = 'https://NEW-URL-HERE.jpg',
  updated_at = NOW()
WHERE page = 'trade' AND is_active = TRUE;

-- Update Shops page media URL
UPDATE hero_media 
SET 
  media_url = 'https://NEW-URL-HERE.jpg',
  updated_at = NOW()
WHERE page = 'shops' AND is_active = TRUE;

-- Update video poster
UPDATE hero_media 
SET 
  poster_url = 'https://NEW-POSTER-URL.jpg',
  updated_at = NOW()
WHERE page = 'trade' AND is_active = TRUE;

-- ────────────────────────────────────────────────────────────
-- 7️⃣  DELETE HERO MEDIA
-- ────────────────────────────────────────────────────────────

-- Delete specific hero by ID
DELETE FROM hero_media WHERE id = 'your-uuid-here';

-- Delete all inactive heroes
DELETE FROM hero_media WHERE is_active = FALSE;

-- Delete all for Trade page
DELETE FROM hero_media WHERE page = 'trade';

-- Delete all for Shops page
DELETE FROM hero_media WHERE page = 'shops';

-- Delete everything (CAUTION!)
DELETE FROM hero_media;

-- ────────────────────────────────────────────────────────────
-- 8️⃣  USEFUL QUERIES
-- ────────────────────────────────────────────────────────────

-- Count hero media per page
SELECT page, COUNT(*) as total, 
       SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active
FROM hero_media 
GROUP BY page;

-- Find video heroes
SELECT page, media_url, poster_url 
FROM hero_media 
WHERE media_type = 'video' AND is_active = TRUE;

-- Find image heroes
SELECT page, media_url 
FROM hero_media 
WHERE media_type = 'image' AND is_active = TRUE;

-- Check last update
SELECT page, media_type, updated_at 
FROM hero_media 
WHERE is_active = TRUE 
ORDER BY updated_at DESC;

-- ────────────────────────────────────────────────────────────
-- 9️⃣  SUPABASE STORAGE URLS
-- ────────────────────────────────────────────────────────────

-- After uploading to Supabase Storage bucket 'hero-media',
-- your URLs will look like:

-- https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/hero-media/trade-hero.mp4
-- https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/hero-media/trade-poster.jpg
-- https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/hero-media/shops-hero.jpg

-- Example: Insert with Storage URL
INSERT INTO hero_media (page, media_type, media_url, is_active)
VALUES (
  'trade', 
  'video',
  'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/hero-media/trade-video.mp4',
  TRUE
);

-- ────────────────────────────────────────────────────────────
-- 🔟  TROUBLESHOOTING
-- ────────────────────────────────────────────────────────────

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'hero_media'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'hero_media';

-- Check for duplicate active heroes (should return 0 or 1 per page)
SELECT page, COUNT(*) 
FROM hero_media 
WHERE is_active = TRUE 
GROUP BY page 
HAVING COUNT(*) > 1;

-- View table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hero_media'
ORDER BY ordinal_position;

-- ============================================================
-- 📝 NOTES
-- ============================================================
-- 
-- • Replace 'YOUR-IMAGE-URL-HERE.jpg' with actual URLs
-- • Use public URLs that are accessible from browser
-- • Images: JPG, PNG, WebP (recommended: 1920x600px)
-- • Videos: MP4, WebM (recommended: under 5MB)
-- • Only one active hero per page at a time
-- • Changes appear immediately on your website
-- 
-- ============================================================
