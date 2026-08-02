# Category Icons Control Guide

## ✅ Status: FULLY CONNECTED

Your category icons are now controlled from Supabase! You can turn them on/off and change them anytime.

## 🚀 Quick Setup (2 Minutes)

### Step 1: Create the Table

Open **Supabase Dashboard** → SQL Editor and run:

```sql
CREATE TABLE IF NOT EXISTS category_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(100) NOT NULL UNIQUE,
  icon_emoji VARCHAR(10) NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_category_icons_name ON category_icons(category_name);
ALTER TABLE category_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON category_icons FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON category_icons FOR ALL USING (auth.role() = 'authenticated');
```

### Step 2: Insert Default Icons

```sql
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
  is_active = EXCLUDED.is_active;
```

### Step 3: Refresh Your Page

That's it! The icons are now live and controlled from Supabase.

## 🎮 Control Commands

### Turn OFF All Icons (Hide All Emojis)
```sql
UPDATE category_icons 
SET is_active = FALSE, updated_at = NOW();
```

### Turn ON All Icons (Show All Emojis)
```sql
UPDATE category_icons 
SET is_active = TRUE, updated_at = NOW();
```

### Turn OFF Specific Icon
```sql
UPDATE category_icons 
SET is_active = FALSE 
WHERE category_name = 'Pesticides';
```

### Turn ON Specific Icon
```sql
UPDATE category_icons 
SET is_active = TRUE 
WHERE category_name = 'Fertilizers';
```

### Change an Icon
```sql
UPDATE category_icons 
SET icon_emoji = '🌾' 
WHERE category_name = 'Fertilizers';
```

### Remove All Icons (Set to Empty)
```sql
UPDATE category_icons 
SET icon_emoji = '', updated_at = NOW();
```

### Change Multiple Icons at Once
```sql
UPDATE category_icons
SET icon_emoji = CASE category_name
  WHEN 'Fertilizers' THEN '🌾'
  WHEN 'Pesticides' THEN '☠️'
  WHEN 'Seeds' THEN '🫘'
  ELSE icon_emoji
END,
updated_at = NOW()
WHERE category_name IN ('Fertilizers', 'Pesticides', 'Seeds');
```

## 📊 View Commands

### View All Icons
```sql
SELECT category_name, icon_emoji, is_active, display_order 
FROM category_icons 
ORDER BY display_order;
```

### View Only Active Icons
```sql
SELECT category_name, icon_emoji 
FROM category_icons 
WHERE is_active = TRUE 
ORDER BY display_order;
```

### Count Active vs Inactive
```sql
SELECT 
  is_active,
  COUNT(*) as count
FROM category_icons
GROUP BY is_active;
```

## 🎨 Emoji Reference

### Agriculture & Plants
🌿 🌱 🌾 🌳 🌲 🍃 🌴 🎋 🌵 🪴 🫘 🌻 🌺

### Chemistry & Science
🧪 🔬 🧬 ⚗️ 🧫 💊 💉 🩺

### Tools & Equipment
⚙️ 🔧 🔨 🪛 🪚 ⚒️ 🛠️ 🚜 🏗️

### Animals & Nature
🐟 🐠 🦐 🐛 🪱 🐝 🦋 🐄 🐖 🐓 🦆

### Food & Crops
🍎 🍊 🍌 🥕 🥬 🥦 🌽 🥔 🍇 🍉 🫐

### Buildings & Shops
🏪 🏬 🏢 🏭 🏛️ 🏗️

### Water & Environment
💧 💦 🌊 🌡️ ☀️ 🌤️ ⛈️ 🌧️

## ✨ Examples

### Example 1: Hide All Icons
```sql
UPDATE category_icons SET is_active = FALSE;
```
Result: No emojis show next to categories ✅

### Example 2: Show Only Some Icons
```sql
-- Turn all off first
UPDATE category_icons SET is_active = FALSE;

-- Turn on only specific ones
UPDATE category_icons SET is_active = TRUE 
WHERE category_name IN ('Fertilizers', 'Seeds', 'Pesticides');
```
Result: Only 🌿 Fertilizers, 🌱 Seeds, and 🧪 Pesticides show icons ✅

### Example 3: Change Icon Style
```sql
-- Switch to different emojis
UPDATE category_icons
SET icon_emoji = CASE category_name
  WHEN 'Fertilizers' THEN '🌾'
  WHEN 'Pesticides' THEN '☠️'
  WHEN 'Seeds' THEN '🫘'
  WHEN 'Equipment' THEN '🚜'
  ELSE icon_emoji
END;
```
Result: Categories now use different emojis ✅

## 🔄 How It Works

```
Shops Page Loads
    ↓
Fetch icons from Supabase: fetchCategoryIcons()
    ↓
Gets all active icons: SELECT * WHERE is_active = TRUE
    ↓
Returns object: { Fertilizers: '🌿', Seeds: '🌱', ... }
    ↓
Component uses categoryIcons[cat] to show emoji
    ↓
If is_active = FALSE, icon doesn't appear!
```

## 📱 Where Icons Appear

1. **Category chips** - Top of shops page
2. **Shop category tags** - On each shop card
3. **Register form** - When creating a new shop

All three locations are now controlled from the same Supabase table!

## 🐛 Troubleshooting

**Icons not showing?**
- Check: `SELECT * FROM category_icons WHERE is_active = TRUE;`
- Refresh your browser page
- Clear browser cache

**Icons not updating?**
- Run the UPDATE command again
- Check you're updating the correct category_name
- Refresh browser after making changes

**Wrong icons showing?**
- View all: `SELECT * FROM category_icons;`
- Check the icon_emoji column matches what you want
- Make sure spelling matches exactly (case-sensitive)

## 📚 Full Documentation

See `category_icons_sql.sql` for complete reference with all commands.

---

**That's it!** Your category icons are now fully controlled from Supabase. Make changes anytime without touching code! 🎉
