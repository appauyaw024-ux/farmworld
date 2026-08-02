-- ============================================================
-- CATEGORY ICONS - SQL SCHEMA & MANAGEMENT
-- Control category icons/emojis from Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREATE TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(100) NOT NULL UNIQUE,
  icon_emoji VARCHAR(10) NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_category_icons_name ON category_icons(category_name);
CREATE INDEX IF NOT EXISTS idx_category_icons_active ON category_icons(is_active);
CREATE INDEX IF NOT EXISTS idx_category_icons_order ON category_icons(display_order);

-- ------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE category_icons ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow public read access" 
  ON category_icons 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated insert/update" 
  ON category_icons 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 3. INSERT DEFAULT CATEGORY ICONS
-- ------------------------------------------------------------

INSERT INTO category_icons (category_name, icon_emoji, is_active, display_order)
VALUES 
  ('All', '🏪', TRUE, 0),
  ('Fertilizers', '🌿', TRUE, 1),
  ('Pesticides', '🧪', TRUE, 2),
  ('Seeds', '🌱', TRUE, 3),
  ('Organic Inputs', '🍃', TRUE, 4),
  ('Equipment', '⚙️', TRUE, 5),
  ('Soil Health', '🪱', TRUE, 6),
  ('Bio-Fertilizers', '🔬', TRUE, 7),
  ('Nutrients', '💊', TRUE, 8),
  ('Aquaculture', '🐟', TRUE, 9)
ON CONFLICT (category_name) DO UPDATE SET
  icon_emoji = EXCLUDED.icon_emoji,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ------------------------------------------------------------
-- 4. QUICK REFERENCE COMMANDS
-- ------------------------------------------------------------

-- VIEW ALL ICONS
SELECT category_name, icon_emoji, is_active, display_order 
FROM category_icons 
ORDER BY display_order;

-- TURN OFF ALL ICONS (hide all emojis)
UPDATE category_icons 
SET is_active = FALSE, updated_at = NOW();

-- TURN ON ALL ICONS (show all emojis)
UPDATE category_icons 
SET is_active = TRUE, updated_at = NOW();

-- TURN OFF SPECIFIC ICON
UPDATE category_icons 
SET is_active = FALSE, updated_at = NOW()
WHERE category_name = 'Pesticides';

-- TURN ON SPECIFIC ICON
UPDATE category_icons 
SET is_active = TRUE, updated_at = NOW()
WHERE category_name = 'Pesticides';

-- CHANGE AN ICON
UPDATE category_icons 
SET icon_emoji = '🌾', updated_at = NOW()
WHERE category_name = 'Fertilizers';

-- REMOVE ALL ICONS (set to empty)
UPDATE category_icons 
SET icon_emoji = '', updated_at = NOW();

-- CHANGE MULTIPLE ICONS AT ONCE
UPDATE category_icons
SET icon_emoji = CASE category_name
  WHEN 'Fertilizers' THEN '🌾'
  WHEN 'Pesticides' THEN '☠️'
  WHEN 'Seeds' THEN '🫘'
  ELSE icon_emoji
END,
updated_at = NOW()
WHERE category_name IN ('Fertilizers', 'Pesticides', 'Seeds');

-- GET ONLY ACTIVE ICONS
SELECT category_name, icon_emoji 
FROM category_icons 
WHERE is_active = TRUE 
ORDER BY display_order;

-- REORDER CATEGORIES
UPDATE category_icons
SET display_order = CASE category_name
  WHEN 'All' THEN 0
  WHEN 'Fertilizers' THEN 1
  WHEN 'Seeds' THEN 2
  WHEN 'Pesticides' THEN 3
  ELSE display_order
END;

-- ------------------------------------------------------------
-- 5. EXPORT / IMPORT
-- ------------------------------------------------------------

-- Export to JSON
SELECT json_agg(
  json_build_object(
    'category', category_name,
    'icon', icon_emoji,
    'active', is_active,
    'order', display_order
  ) ORDER BY display_order
) AS icons_export
FROM category_icons;

-- Export to CSV
COPY category_icons TO '/path/to/export/category_icons.csv' 
WITH (FORMAT CSV, HEADER);

-- Import from CSV
COPY category_icons (category_name, icon_emoji, is_active, display_order)
FROM '/path/to/import/category_icons.csv'
WITH (FORMAT CSV, HEADER);

-- ------------------------------------------------------------
-- 6. STATISTICS
-- ------------------------------------------------------------

-- Count active vs inactive
SELECT 
  is_active,
  COUNT(*) as count
FROM category_icons
GROUP BY is_active;

-- List categories without icons (empty emoji)
SELECT category_name, is_active 
FROM category_icons 
WHERE icon_emoji = '' OR icon_emoji IS NULL;

-- List active categories with icons
SELECT category_name, icon_emoji 
FROM category_icons 
WHERE is_active = TRUE AND icon_emoji != '';

-- ------------------------------------------------------------
-- 7. CLEANUP
-- ------------------------------------------------------------

-- Reset all to defaults (re-run section 3)

-- Drop table (WARNING: deletes all data)
-- DROP TABLE IF EXISTS category_icons;

-- ============================================================
-- EMOJI REFERENCE
-- ============================================================
-- 
-- Agriculture & Plants:
-- 🌿 🌱 🌾 🌳 🌲 🍃 🌴 🎋 🌵 🪴 🫘 🌻 🌺
-- 
-- Chemistry & Science:
-- 🧪 🔬 🧬 ⚗️ 🧫 💊 💉 🩺
-- 
-- Tools & Equipment:
-- ⚙️ 🔧 🔨 🪛 🪚 ⚒️ 🛠️ 🚜 🏗️
-- 
-- Animals & Nature:
-- 🐟 🐠 🦐 🐛 🪱 🐝 🦋 🐄 🐖 🐓 🦆
-- 
-- Food & Crops:
-- 🍎 🍊 🍌 🥕 🥬 🥦 🌽 🥔 🍇 🍉 🫐
-- 
-- Buildings & Shops:
-- 🏪 🏬 🏢 🏭 🏛️ 🏗️ 🏚️
-- 
-- Water & Environment:
-- 💧 💦 🌊 🌡️ ☀️ 🌤️ ⛈️ 🌧️
-- 
-- ============================================================
