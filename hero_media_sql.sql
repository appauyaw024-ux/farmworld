-- ============================================================
-- HERO MEDIA TABLE - SQL SCHEMA & OPERATIONS
-- For managing hero images/videos on Trade and Shops pages
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(50) NOT NULL, -- 'trade' or 'shops'
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  poster_url TEXT, -- For video thumbnails/posters
  title VARCHAR(255), -- Optional title for hero section
  subtitle TEXT, -- Optional subtitle
  badge_label VARCHAR(100), -- Optional badge (e.g., "Featured", "New")
  is_active BOOLEAN DEFAULT TRUE, -- Allow multiple but only show active ones
  display_order INTEGER DEFAULT 1, -- For ordering multiple hero items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_hero_media_page ON hero_media(page);
CREATE INDEX IF NOT EXISTS idx_hero_media_active ON hero_media(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_media_page_active ON hero_media(page, is_active);

-- ------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY (Optional but recommended)
-- ------------------------------------------------------------
ALTER TABLE hero_media ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read hero media (public)
CREATE POLICY "Allow public read access" 
  ON hero_media 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update (admin only in production)
CREATE POLICY "Allow authenticated insert/update" 
  ON hero_media 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 3. SAMPLE DATA INSERT (for testing)
-- ------------------------------------------------------------

-- Insert hero media for Trade page (video example)
INSERT INTO hero_media (page, media_type, media_url, poster_url, title, subtitle, badge_label, is_active, display_order)
VALUES (
  'trade',
  'video',
  'https://your-supabase-storage.com/videos/trade-hero.mp4',
  'https://your-supabase-storage.com/images/trade-hero-poster.jpg',
  'Global Agricultural Trade',
  'Connect with farmers worldwide',
  'Live Trading',
  TRUE,
  1
);

-- Insert hero media for Shops page (image example)
INSERT INTO hero_media (page, media_type, media_url, title, subtitle, badge_label, is_active, display_order)
VALUES (
  'shops',
  'image',
  'https://your-supabase-storage.com/images/shops-hero.jpg',
  'Find Trusted Suppliers',
  'Verified agro-chemical shops',
  'Verified',
  TRUE,
  1
);

-- ------------------------------------------------------------
-- 4. QUERY OPERATIONS
-- ------------------------------------------------------------

-- Get active hero media for a specific page
SELECT * FROM hero_media 
WHERE page = 'trade' AND is_active = TRUE 
ORDER BY display_order, created_at DESC;

SELECT * FROM hero_media 
WHERE page = 'shops' AND is_active = TRUE 
ORDER BY display_order, created_at DESC;

-- Get all hero media for a page (including inactive)
SELECT * FROM hero_media WHERE page = 'trade' ORDER BY display_order;
SELECT * FROM hero_media WHERE page = 'shops' ORDER BY display_order;

-- Get all hero media across all pages
SELECT * FROM hero_media ORDER BY page, display_order;

-- Update hero media for Trade page (set new video)
UPDATE hero_media 
SET 
  media_type = 'video',
  media_url = 'https://new-video-url.com/hero.mp4',
  poster_url = 'https://new-poster-url.com/poster.jpg',
  updated_at = NOW()
WHERE page = 'trade' AND is_active = TRUE;

-- Update hero media for Shops page (set new image)
UPDATE hero_media 
SET 
  media_type = 'image',
  media_url = 'https://new-image-url.com/hero.jpg',
  poster_url = NULL,
  updated_at = NOW()
WHERE page = 'shops' AND is_active = TRUE;

-- Deactivate all hero media for a page (before adding new one)
UPDATE hero_media 
SET is_active = FALSE, updated_at = NOW()
WHERE page = 'trade';

-- Add new hero media and set as active
INSERT INTO hero_media (page, media_type, media_url, poster_url, is_active)
VALUES ('trade', 'video', 'https://new-url.com/video.mp4', 'https://new-url.com/poster.jpg', TRUE);

-- Delete specific hero media
DELETE FROM hero_media WHERE id = 'your-uuid-here';

-- Delete all hero media for a specific page
DELETE FROM hero_media WHERE page = 'trade';

-- ------------------------------------------------------------
-- 5. EXPORT DATA (PostgreSQL COPY command)
-- ------------------------------------------------------------

-- Export to CSV file
COPY hero_media TO '/path/to/export/hero_media.csv' 
WITH (FORMAT CSV, HEADER);

-- Export to JSON (using json_agg)
COPY (
  SELECT json_agg(row_to_json(hero_media)) 
  FROM hero_media
) TO '/path/to/export/hero_media.json';

-- Export specific page data
COPY (
  SELECT * FROM hero_media WHERE page = 'trade'
) TO '/path/to/export/trade_hero_media.csv' 
WITH (FORMAT CSV, HEADER);

-- Export only active hero media
COPY (
  SELECT * FROM hero_media WHERE is_active = TRUE
) TO '/path/to/export/active_hero_media.csv' 
WITH (FORMAT CSV, HEADER);

-- ------------------------------------------------------------
-- 6. IMPORT DATA (PostgreSQL COPY command)
-- ------------------------------------------------------------

-- Import from CSV file
COPY hero_media (page, media_type, media_url, poster_url, title, subtitle, badge_label, is_active, display_order)
FROM '/path/to/import/hero_media.csv'
WITH (FORMAT CSV, HEADER);

-- ------------------------------------------------------------
-- 7. BACKUP & RESTORE (pg_dump / psql commands)
-- ------------------------------------------------------------

-- BACKUP: Export table structure and data
-- Run this in your terminal (not in SQL editor)
-- pg_dump -h your-host -U your-user -d your-database -t hero_media -f hero_media_backup.sql

-- RESTORE: Import table structure and data
-- Run this in your terminal (not in SQL editor)
-- psql -h your-host -U your-user -d your-database -f hero_media_backup.sql

-- ------------------------------------------------------------
-- 8. SUPABASE STORAGE INTEGRATION (Optional)
-- ------------------------------------------------------------

-- If using Supabase Storage, create a bucket for hero media
-- This is done via Supabase Dashboard or Storage API, not SQL
-- Bucket name: 'hero-media'
-- Public: true (for public access to images/videos)

-- Example URLs after uploading to Supabase Storage:
-- https://[project-id].supabase.co/storage/v1/object/public/hero-media/trade-video.mp4
-- https://[project-id].supabase.co/storage/v1/object/public/hero-media/shops-image.jpg

-- ------------------------------------------------------------
-- 9. JSON EXPORT/IMPORT (Alternative format)
-- ------------------------------------------------------------

-- Export all data as JSON array
SELECT json_agg(
  json_build_object(
    'id', id,
    'page', page,
    'media_type', media_type,
    'media_url', media_url,
    'poster_url', poster_url,
    'title', title,
    'subtitle', subtitle,
    'badge_label', badge_label,
    'is_active', is_active,
    'display_order', display_order,
    'created_at', created_at,
    'updated_at', updated_at
  )
) AS hero_media_export
FROM hero_media;

-- Import from JSON (using INSERT with VALUES)
INSERT INTO hero_media (page, media_type, media_url, poster_url, title, is_active)
VALUES 
  ('trade', 'video', 'https://example.com/video.mp4', 'https://example.com/poster.jpg', 'Trade Hero', TRUE),
  ('shops', 'image', 'https://example.com/image.jpg', NULL, 'Shops Hero', TRUE);

-- ------------------------------------------------------------
-- 10. MIGRATION HELPER (Update existing data)
-- ------------------------------------------------------------

-- Add default hero media if none exists for Trade page
INSERT INTO hero_media (page, media_type, media_url, title, subtitle, is_active)
SELECT 'trade', 'image', 'https://default-hero-image.jpg', 'Global Trade', 'Agricultural marketplace', TRUE
WHERE NOT EXISTS (SELECT 1 FROM hero_media WHERE page = 'trade');

-- Add default hero media if none exists for Shops page
INSERT INTO hero_media (page, media_type, media_url, title, subtitle, is_active)
SELECT 'shops', 'image', 'https://default-shops-image.jpg', 'Find Suppliers', 'Agro-chemical directory', TRUE
WHERE NOT EXISTS (SELECT 1 FROM hero_media WHERE page = 'shops');

-- Convert old page_type column to new page column (if migrating from old schema)
-- Only run this if you have an old table with page_type
-- ALTER TABLE hero_media RENAME COLUMN page_type TO page;

-- ------------------------------------------------------------
-- 11. CLEANUP / DROP TABLE (Use with caution!)
-- ------------------------------------------------------------

-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON hero_media;
DROP POLICY IF EXISTS "Allow authenticated insert/update" ON hero_media;

-- Drop table (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS hero_media;

-- ============================================================
-- NOTES FOR SUPABASE DASHBOARD USAGE
-- ============================================================
-- 
-- To use this in Supabase:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste the CREATE TABLE section (section 1)
-- 5. Click "Run" to create the table
-- 6. Use section 3 to insert sample data
-- 7. Query data using section 4
--
-- For EXPORT in Supabase:
-- 1. Use the Supabase Dashboard > Table Editor
-- 2. Select the hero_media table
-- 3. Click the download icon to export as CSV
--
-- For IMPORT in Supabase:
-- 1. Use the SQL Editor to run INSERT statements (section 9)
-- 2. Or use the Supabase API with your app
--
-- ============================================================
