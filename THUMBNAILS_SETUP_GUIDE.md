# Page Thumbnails Setup Guide

## 📸 Overview

This system allows you to manage thumbnail/preview images for all pages in your application from Supabase. Perfect for:
- Social media sharing (Open Graph images)
- Navigation cards
- Page previews
- SEO optimization

## 🚀 Quick Setup (3 Minutes)

### Step 1: Create the Table

1. Open **Supabase Dashboard** → SQL Editor
2. Copy and paste this:

```sql
CREATE TABLE IF NOT EXISTS page_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name VARCHAR(100) NOT NULL UNIQUE,
  thumbnail_url TEXT NOT NULL,
  thumbnail_alt TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_thumbnails_page_name ON page_thumbnails(page_name);
CREATE INDEX idx_page_thumbnails_active ON page_thumbnails(is_active);

ALTER TABLE page_thumbnails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
  ON page_thumbnails FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update" 
  ON page_thumbnails FOR ALL USING (auth.role() = 'authenticated');
```

3. Click **Run**

### Step 2: Insert Default Thumbnails

Copy and paste this to add thumbnails for all pages:

```sql
INSERT INTO page_thumbnails (page_name, thumbnail_url, thumbnail_alt, is_active)
VALUES 
  ('feed', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300', 'Agricultural feed', TRUE),
  ('trade', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300', 'Trade marketplace', TRUE),
  ('shops', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300', 'Agro-chemical shops', TRUE),
  ('jobs', 'https://images.unsplash.com/photo-1560264280-88b68371db39?w=400&h=300', 'Agricultural jobs', TRUE),
  ('messaging', 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=300', 'Messaging', TRUE),
  ('network', 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=300', 'Network', TRUE),
  ('notifications', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300', 'Notifications', TRUE),
  ('profile', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=300', 'Profile', TRUE)
ON CONFLICT (page_name) DO UPDATE SET
  thumbnail_url = EXCLUDED.thumbnail_url,
  updated_at = NOW();
```

### Step 3: Add API Functions (Optional)

Add these functions to `src/lib/api.js`:

```javascript
// Fetch thumbnail for a specific page
export async function fetchPageThumbnail(pageName) {
  try {
    const { data, error } = await supabase
      .from('page_thumbnails')
      .select('thumbnail_url, thumbnail_alt')
      .eq('page_name', pageName)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.warn('fetchPageThumbnail error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('fetchPageThumbnail error:', err);
    return null;
  }
}

// Fetch all thumbnails
export async function fetchAllThumbnails() {
  try {
    const { data, error } = await supabase
      .from('page_thumbnails')
      .select('*')
      .eq('is_active', true)
      .order('page_name');
    
    if (error) throw error;
    
    // Transform to object for easy lookup: { feed: {...}, trade: {...} }
    const thumbnailsMap = {};
    (data || []).forEach(item => {
      thumbnailsMap[item.page_name] = {
        url: item.thumbnail_url,
        alt: item.thumbnail_alt
      };
    });
    
    return thumbnailsMap;
  } catch (err) {
    console.warn('fetchAllThumbnails error:', err);
    return {};
  }
}
```

## 📊 Supported Pages

| Page Name | Description |
|-----------|-------------|
| `feed` | Home feed page |
| `trade` | Trade marketplace page |
| `shops` | Agro-chemical shops directory |
| `jobs` | Jobs listing page |
| `messaging` | Messaging/chat page |
| `network` | Network/connections page |
| `notifications` | Notifications page |
| `profile` | User profile page |
| `shopdetail` | Individual shop detail pages |

## 🎨 Thumbnail Specifications

### Recommended Specs
- **Size**: 400x300px (or 800x600px for high-res)
- **Aspect Ratio**: 4:3
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 100KB
- **Purpose**: Social sharing, navigation, previews

### Naming Convention
Use the page name as filename:
- `trade.jpg`
- `shops.jpg`
- `feed.jpg`

## 💾 Upload to Supabase Storage

### Step 1: Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `thumbnails`
4. Make it **Public**
5. Click **Create**

### Step 2: Upload Images
1. Open the `thumbnails` bucket
2. Click **Upload**
3. Select your thumbnail images
4. Upload them

### Step 3: Get URLs
1. Click on any uploaded file
2. Copy the **Public URL**
3. It will look like: `https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/trade.jpg`

### Step 4: Update Database
```sql
-- Update single page
UPDATE page_thumbnails 
SET thumbnail_url = 'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/trade.jpg',
    updated_at = NOW()
WHERE page_name = 'trade';

-- Update all pages (assuming files are named: feed.jpg, trade.jpg, etc.)
UPDATE page_thumbnails
SET thumbnail_url = 'https://sufdhaxlabisrykwqkzm.supabase.co/storage/v1/object/public/thumbnails/' || page_name || '.jpg',
    updated_at = NOW();
```

## 🔧 Common Operations

### View All Thumbnails
```sql
SELECT page_name, thumbnail_url 
FROM page_thumbnails 
WHERE is_active = TRUE 
ORDER BY page_name;
```

### Update Thumbnail for Trade Page
```sql
UPDATE page_thumbnails 
SET thumbnail_url = 'https://your-new-url.jpg',
    thumbnail_alt = 'New description',
    updated_at = NOW()
WHERE page_name = 'trade';
```

### Update Multiple Thumbnails
```sql
UPDATE page_thumbnails
SET thumbnail_url = CASE page_name
  WHEN 'trade' THEN 'https://example.com/trade.jpg'
  WHEN 'shops' THEN 'https://example.com/shops.jpg'
  WHEN 'jobs' THEN 'https://example.com/jobs.jpg'
  ELSE thumbnail_url
END,
updated_at = NOW()
WHERE page_name IN ('trade', 'shops', 'jobs');
```

### Deactivate a Thumbnail
```sql
UPDATE page_thumbnails 
SET is_active = FALSE, updated_at = NOW()
WHERE page_name = 'trade';
```

### Delete a Thumbnail
```sql
DELETE FROM page_thumbnails 
WHERE page_name = 'trade';
```

## 📱 Usage in Components

### Example 1: In a Page Component
```javascript
import { useEffect, useState } from 'react';
import { fetchPageThumbnail } from '../lib/api';

function TradePage() {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    fetchPageThumbnail('trade').then(data => {
      if (data) setThumbnail(data);
    });
  }, []);

  return (
    <div>
      {thumbnail && (
        <img 
          src={thumbnail.thumbnail_url} 
          alt={thumbnail.thumbnail_alt}
        />
      )}
    </div>
  );
}
```

### Example 2: For Social Meta Tags
```javascript
import { useEffect } from 'react';
import { fetchPageThumbnail } from '../lib/api';

function usePageMeta(pageName, pageTitle) {
  useEffect(() => {
    fetchPageThumbnail(pageName).then(data => {
      if (data) {
        // Update Open Graph meta tags
        const metaOgImage = document.querySelector('meta[property="og:image"]');
        if (metaOgImage) {
          metaOgImage.content = data.thumbnail_url;
        }
      }
    });
  }, [pageName]);
}

// Usage
function TradePage() {
  usePageMeta('trade', 'Agricultural Trade Marketplace');
  return <div>...</div>;
}
```

### Example 3: Navigation Cards
```javascript
import { useEffect, useState } from 'react';
import { fetchAllThumbnails } from '../lib/api';

function NavigationCards() {
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    fetchAllThumbnails().then(data => setThumbnails(data));
  }, []);

  const pages = [
    { name: 'trade', title: 'Trade', path: '/trade' },
    { name: 'shops', title: 'Shops', path: '/shops' },
    { name: 'jobs', title: 'Jobs', path: '/jobs' }
  ];

  return (
    <div className="nav-cards">
      {pages.map(page => (
        <div key={page.name} className="nav-card">
          {thumbnails[page.name] && (
            <img 
              src={thumbnails[page.name].url} 
              alt={thumbnails[page.name].alt}
            />
          )}
          <h3>{page.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Verification

After setup, verify everything works:

```sql
-- Should return 8 rows
SELECT COUNT(*) FROM page_thumbnails WHERE is_active = TRUE;

-- Should show all pages
SELECT page_name, thumbnail_url 
FROM page_thumbnails 
WHERE is_active = TRUE;
```

## 🐛 Troubleshooting

**Table doesn't exist?**
- Run the CREATE TABLE command from Step 1

**Can't insert data?**
- Check RLS policies are created
- Ensure you're authenticated in Supabase

**Thumbnail not showing?**
- Verify URL is accessible (open in browser)
- Check `is_active = TRUE` for that page
- Check for CORS errors in browser console

**Storage URLs not working?**
- Ensure bucket is set to **Public**
- Verify file was uploaded successfully
- Copy URL from Supabase Storage panel

## 📚 Full Documentation

See `page_thumbnails_sql.sql` for:
- Complete table schema
- All SQL operations
- Helper functions
- Export/import commands
- Validation constraints
- Maintenance queries

## ✨ Benefits

✅ **Centralized Management** - Update all thumbnails from one place  
✅ **Social Media Ready** - Perfect for Open Graph/Twitter Cards  
✅ **SEO Optimized** - Better search engine previews  
✅ **Easy Updates** - Change thumbnails without code deployment  
✅ **Version Control** - Track when thumbnails were updated  
✅ **Flexible** - Use external URLs or Supabase Storage  

---

**Ready to start?** Run the SQL commands in Step 1 and Step 2, then your thumbnails are live!
