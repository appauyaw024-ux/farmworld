-- ============================================================
-- PAGE THUMBNAILS - SQL SCHEMA & MANAGEMENT
-- For managing thumbnail/preview images for all pages
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name VARCHAR(100) NOT NULL UNIQUE, -- 'feed', 'trade', 'shops', 'jobs', 'messaging', 'network', 'notifications', 'profile'
  thumbnail_url TEXT NOT NULL,
  thumbnail_alt TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_thumbnails_page_name ON page_thumbnails(page_name);
CREATE INDEX IF NOT EXISTS idx_page_thumbnails_active ON page_thumbnails(is_active);

-- ------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY (Optional but recommended)
-- ------------------------------------------------------------
ALTER TABLE page_thumbnails ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read thumbnails (public)
CREATE POLICY "Allow public read access" 
  ON page_thumbnails 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update (admin only in production)
CREATE POLICY "Allow authenticated insert/update" 
  ON page_thumbnails 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 3. INSERT DEFAULT THUMBNAILS FOR ALL PAGES
-- ------------------------------------------------------------

-- Feed page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'feed',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
  'Agricultural feed and networking',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Trade page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'trade',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
  'Agricultural trade and export marketplace',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Shops page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'shops',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
  'Agro-chemical shops directory',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Jobs page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'jobs',
  'https://images.unsplash.com/photo-1560264280-88b68371db39?w=400&h=300&fit=crop',
  'Agricultural jobs and opportunities',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Messaging page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'messaging',
  'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300&fit=crop',
  'Messaging and communication',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Network page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'network',
  'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=300&fit=crop',
  'Professional network and connections',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Notifications page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'notifications',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
  'Notifications and updates',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- Profile page thumbnail
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'profile',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=300&fit=crop',
  'User profile and settings',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- ShopDetail page thumbnail (for individual shop pages)
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES (
  'shopdetail',
  'https://images.unsplash.com/photo-1534237886190-ced735ca4b73?w=400&h=300&fit=crop',
  'Shop details and products',
  TRUE
)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- ------------------------------------------------------------
-- 4. QUERY OPERATIONS
-- ------------------------------------------------------------

-- Get all active thumbnails
SELECT page_name, thumbnail_url, thumbnail_alt 
FROM page_thumbnails 
WHERE is_active = TRUE 
ORDER BY page_name;

-- Get thumbnail for a specific page
SELECT thumbnail_url, thumbnail_alt 
FROM page_thumbnails 
WHERE page_name = 'trade' AND is_active = TRUE;

-- Get all thumbnails (including inactive)
SELECT * FROM page_thumbnails ORDER BY page_name;

-- Update thumbnail for a specific page
UPDATE page_thumbnails 
SET 
  thumbnail_url = 'https://new-thumbnail-url.jpg',
  thumbnail_alt = 'New alt text',
  updated_at = NOW()
WHERE page_name = 'trade';

-- Deactivate a thumbnail
UPDATE page_thumbnails 
SET is_active = FALSE, updated_at = NOW()
WHERE page_name = 'trade';

-- Reactivate a thumbnail
UPDATE page_thumbnails 
SET is_active = TRUE, updated_at = NOW()
WHERE page_name = 'trade';

-- Delete a thumbnail
DELETE FROM page_thumbnails WHERE page_name = 'trade';

-- ------------------------------------------------------------
-- 5. BULK UPDATE OPERATIONS
-- ------------------------------------------------------------

-- Update multiple thumbnails at once
UPDATE page_thumbnails
SET thumbnail_url = CASE page_name
  WHEN 'trade' THEN 'https://your-storage.com/trade-thumb.jpg'
  WHEN 'shops' THEN 'https://your-storage.com/shops-thumb.jpg'
  WHEN 'jobs' THEN 'https://your-storage.com/jobs-thumb.jpg'
  ELSE thumbnail_url
END,
updated_at = NOW()
WHERE page_name IN ('trade', 'shops', 'jobs');

-- Deactivate all thumbnails
UPDATE page_thumbnails 
SET is_active = FALSE, updated_at = NOW();

-- Activate all thumbnails
UPDATE page_thumbnails 
SET is_active = TRUE, updated_at = NOW();

-- ------------------------------------------------------------
-- 6. SUPABASE STORAGE URLS
-- ------------------------------------------------------------

-- After uploading to Supabase Storage bucket 'thumbnails',
-- your URLs will look like:
-- https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/trade-thumb.jpg
-- https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/shops-thumb.jpg

-- Example: Update with Storage URLs
UPDATE page_thumbnails 
SET thumbnail_url = 'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/trade.jpg'
WHERE page_name = 'trade';

-- ------------------------------------------------------------
-- 7. EXPORT DATA
-- ------------------------------------------------------------

-- Export to CSV
COPY page_thumbnails TO '/path/to/export/page_thumbnails.csv' 
WITH (FORMAT CSV, HEADER);

-- Export to JSON
COPY (
  SELECT json_agg(row_to_json(page_thumbnails)) 
  FROM page_thumbnails
) TO '/path/to/export/page_thumbnails.json';

-- Export only active thumbnails
COPY (
  SELECT * FROM page_thumbnails WHERE is_active = TRUE
) TO '/path/to/export/active_thumbnails.csv' 
WITH (FORMAT CSV, HEADER);

-- Export as JSON for API
SELECT json_agg(
  json_build_object(
    'page', page_name,
    'thumbnail', thumbnail_url,
    'alt', thumbnail_alt,
    'active', is_active
  )
) AS thumbnails_export
FROM page_thumbnails
WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- 8. IMPORT DATA
-- ------------------------------------------------------------

-- Import from CSV
COPY page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
FROM '/path/to/import/page_thumbnails.csv'
WITH (FORMAT CSV, HEADER);

-- Insert multiple thumbnails from VALUES
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES 
  ('trade', 'https://example.com/trade.jpg', 'Trade page', TRUE),
  ('shops', 'https://example.com/shops.jpg', 'Shops page', TRUE),
  ('jobs', 'https://example.com/jobs.jpg', 'Jobs page', TRUE)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  thumbnail_alt = EXCLUDED.thumbnail_alt,
  updated_at = NOW();

-- ------------------------------------------------------------
-- 9. STATISTICS & MONITORING
-- ------------------------------------------------------------

-- Count active vs inactive thumbnails
SELECT 
  is_active,
  COUNT(*) as count
FROM page_thumbnails
GROUP BY is_active;

-- List pages without thumbnails
SELECT page_name 
FROM (VALUES 
  ('feed'), ('trade'), ('shops'), ('jobs'), 
  ('messaging'), ('network'), ('notifications'), ('profile')
) AS all_pages(page_name)
WHERE page_name NOT IN (
  SELECT page_name FROM page_thumbnails WHERE is_active = TRUE
);

-- Find recently updated thumbnails
SELECT page_name, thumbnail_url, updated_at 
FROM page_thumbnails 
WHERE updated_at > NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- Check for broken URLs (manual verification needed)
SELECT page_name, thumbnail_url 
FROM page_thumbnails 
WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- 10. HELPER FUNCTIONS (Optional)
-- ------------------------------------------------------------

-- Function to get thumbnail by page name
CREATE OR REPLACE FUNCTION get_page_thumbnail(p_page_name VARCHAR)
RETURNS TABLE (
  thumbnail_url TEXT,
  thumbnail_alt TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pt.thumbnail_url, pt.thumbnail_alt
  FROM page_thumbnails pt
  WHERE pt.page_name = p_page_name 
    AND pt.is_active = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM get_page_thumbnail('trade');

-- Function to update thumbnail
CREATE OR REPLACE FUNCTION update_page_thumbnail(
  p_page_name VARCHAR,
  p_thumbnail_url TEXT,
  p_thumbnail_alt TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE page_thumbnails
  SET 
    thumbnail_url = p_thumbnail_url,
    thumbnail_alt = COALESCE(p_thumbnail_alt, thumbnail_alt),
    updated_at = NOW()
  WHERE page_name = p_page_name;
  
  IF NOT FOUND THEN
    INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt)
    VALUES (p_page_name, p_thumbnail_url, p_thumbnail_alt);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT update_page_thumbnail('trade', 'https://new-url.jpg', 'New alt text');

-- ------------------------------------------------------------
-- 11. VALIDATION & CONSTRAINTS
-- ------------------------------------------------------------

-- Add constraint to ensure valid page names
ALTER TABLE page_thumbnails 
ADD CONSTRAINT valid_page_names 
CHECK (page_name IN (
  'feed', 'trade', 'shops', 'jobs', 
  'messaging', 'network', 'notifications', 
  'profile', 'shopdetail'
));

-- Add constraint to ensure URL is not empty
ALTER TABLE page_thumbnails 
ADD CONSTRAINT thumbnail_url_not_empty 
CHECK (LENGTH(TRIM(thumbnail_url)) > 0);

-- ------------------------------------------------------------
-- 12. CLEANUP / MAINTENANCE
-- ------------------------------------------------------------

-- Remove inactive thumbnails older than 30 days
DELETE FROM page_thumbnails 
WHERE is_active = FALSE 
  AND updated_at < NOW() - INTERVAL '30 days';

-- Reset all thumbnails to default (CAUTION!)
-- DELETE FROM page_thumbnails;
-- Then re-run section 3 to insert defaults

-- Drop constraints (if needed)
-- ALTER TABLE page_thumbnails DROP CONSTRAINT IF EXISTS valid_page_names;
-- ALTER TABLE page_thumbnails DROP CONSTRAINT IF EXISTS thumbnail_url_not_empty;

-- Drop functions (if needed)
-- DROP FUNCTION IF EXISTS get_page_thumbnail(VARCHAR);
-- DROP FUNCTION IF EXISTS update_page_thumbnail(VARCHAR, TEXT, TEXT);

-- Drop policies
-- DROP POLICY IF EXISTS "Allow public read access" ON page_thumbnails;
-- DROP POLICY IF EXISTS "Allow authenticated insert/update" ON page_thumbnails;

-- Drop table (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS page_thumbnails;

-- ============================================================
-- QUICK REFERENCE COMMANDS
-- ============================================================

-- VIEW ALL THUMBNAILS
SELECT page_name, thumbnail_url FROM page_thumbnails WHERE is_active = TRUE;

-- UPDATE TRADE PAGE THUMBNAIL
UPDATE page_thumbnails 
SET thumbnail_url = 'https://your-new-url.jpg', updated_at = NOW()
WHERE page_name = 'trade';

-- UPDATE SHOPS PAGE THUMBNAIL
UPDATE page_thumbnails 
SET thumbnail_url = 'https://your-new-url.jpg', updated_at = NOW()
WHERE page_name = 'shops';

-- UPDATE ALL THUMBNAILS WITH SUPABASE STORAGE URLS
UPDATE page_thumbnails
SET thumbnail_url = 'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/' || page_name || '.jpg',
    updated_at = NOW();

-- GET THUMBNAIL FOR SPECIFIC PAGE
SELECT thumbnail_url FROM page_thumbnails WHERE page_name = 'trade' AND is_active = TRUE;

-- ============================================================
-- RECOMMENDED THUMBNAIL SPECS
-- ============================================================
-- 
-- • Size: 400x300px or 800x600px (4:3 aspect ratio)
-- • Format: JPG, PNG, WebP
-- • File size: Under 100KB for fast loading
-- • Naming: page-name.jpg (e.g., trade.jpg, shops.jpg)
-- • Usage: Social sharing, page previews, navigation cards
-- 
-- ============================================================

-- ============================================================
-- INTEGRATION WITH YOUR APP
-- ============================================================
-- 
-- Add to src/lib/api.js:
-- 
-- export async function fetchPageThumbnail(pageName) {
--   const { data, error } = await supabase
--     .from('page_thumbnails')
--     .select('thumbnail_url, thumbnail_alt')
--     .eq('page_name', pageName)
--     .eq('is_active', true)
--     .single();
--   
--   if (error) {
--     console.warn('fetchPageThumbnail error:', error.message);
--     return null;
--   }
--   return data;
-- }
-- 
-- export async function fetchAllThumbnails() {
--   const { data, error } = await supabase
--     .from('page_thumbnails')
--     .select('*')
--     .eq('is_active', true)
--     .order('page_name');
--   
--   if (error) throw error;
--   return data || [];
-- }
-- 
-- ============================================================
