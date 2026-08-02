# Hero Media Connection Flow

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR APPLICATION                          │
│                                                                   │
│  ┌────────────────┐              ┌────────────────┐             │
│  │   Trade Page   │              │   Shops Page   │             │
│  │  /src/pages/   │              │  /src/pages/   │             │
│  │   Trade.jsx    │              │   Shops.jsx    │             │
│  └────────┬───────┘              └────────┬───────┘             │
│           │                               │                      │
│           │ fetchHeroMedia('trade')       │ fetchHeroMedia('shops')
│           │                               │                      │
│           └───────────┬───────────────────┘                      │
│                       │                                          │
│                       ▼                                          │
│           ┌────────────────────────┐                            │
│           │     API Functions      │                            │
│           │   /src/lib/api.js      │                            │
│           │                        │                            │
│           │  - fetchHeroMedia()    │                            │
│           │  - saveHeroMedia()     │                            │
│           └────────────┬───────────┘                            │
│                        │                                         │
│                        │ uses Supabase client                   │
│                        │                                         │
│                        ▼                                         │
│           ┌────────────────────────┐                            │
│           │   Supabase Client      │                            │
│           │  /src/lib/supabase.js  │                            │
│           │                        │                            │
│           │  VITE_SUPABASE_URL     │◄─── .env file              │
│           │  VITE_SUPABASE_ANON_KEY│                            │
│           └────────────┬───────────┘                            │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ HTTPS Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
│    https://sufdhaxlabisrykwqkzm.supabase.co                    │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   hero_media TABLE                         │  │
│  ├────────────┬──────────┬────────────────┬─────────────────┤  │
│  │ id (UUID)  │ page     │ media_type     │ media_url       │  │
│  ├────────────┼──────────┼────────────────┼─────────────────┤  │
│  │ abc-123... │ 'trade'  │ 'video'        │ https://...mp4  │  │
│  │ def-456... │ 'shops'  │ 'image'        │ https://...jpg  │  │
│  └────────────┴──────────┴────────────────┴─────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               RLS POLICIES (Security)                      │  │
│  │  ✓ Public can READ (SELECT)                                │  │
│  │  ✓ Authenticated users can INSERT/UPDATE/DELETE           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          STORAGE BUCKET: hero-media (Optional)            │  │
│  │  • Upload images/videos here                               │  │
│  │  • Get public URLs                                         │  │
│  │  • Use URLs in hero_media table                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### When a User Visits Trade Page:

```
1. User navigates to /trade
   ↓
2. Trade.jsx component mounts
   ↓
3. useEffect() runs: fetchHeroMedia('trade')
   ↓
4. api.js sends query to Supabase:
   SELECT * FROM hero_media 
   WHERE page = 'trade' AND is_active = TRUE
   ↓
5. Supabase returns data (if exists):
   {
     mediaType: 'video',
     mediaUrl: 'https://example.com/hero.mp4',
     posterUrl: 'https://example.com/poster.jpg'
   }
   ↓
6. Trade.jsx receives data and sets heroMedia state
   ↓
7. Component renders <video> or <div> with background image
   ↓
8. Hero section displays with media!
```

### When a User Visits Shops Page:

```
Same flow but with page = 'shops' instead of 'trade'
```

## 📝 Code Connections

### 1. Environment Variables (.env)
```env
VITE_SUPABASE_URL=https://sufdhaxlabisrykwqkzm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. Supabase Client (src/lib/supabase.js)
```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 3. API Function (src/lib/api.js)
```javascript
export async function fetchHeroMedia(page = 'shops') {
  const { data, error } = await supabase
    .from('hero_media')
    .select('*')
    .eq('page', page)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  return data || [];
}
```

### 4. Trade Page (src/pages/Trade.jsx)
```javascript
const [heroMedia, setHeroMedia] = useState(null);

useEffect(() => {
  fetchHeroMedia('trade').then(mediaList => {
    if (mediaList && mediaList.length > 0) {
      setHeroMedia(mediaList[0]);
    }
  });
}, []);

// Render
{heroMedia?.mediaType === 'video' ? (
  <video src={heroMedia.mediaUrl} poster={heroMedia.posterUrl} />
) : (
  <div style={{ backgroundImage: `url("${heroMedia.mediaUrl}")` }} />
)}
```

### 5. Shops Page (src/pages/Shops.jsx)
```javascript
// Same pattern as Trade page
```

## 🎯 What You Control

### In Supabase Dashboard:

1. **Table Structure** (one-time setup)
   - Create `hero_media` table
   - Set up RLS policies
   - Create indexes

2. **Media Content** (ongoing management)
   - Insert new hero media
   - Update existing media URLs
   - Deactivate old media
   - Delete unused media

3. **Storage** (optional)
   - Upload images/videos
   - Manage files
   - Get public URLs

### In Your Code (Already Done):

✅ Supabase client connection  
✅ API functions to fetch/save  
✅ Components fetching and displaying  
✅ Video and image support  
✅ Responsive layouts  
✅ Error handling  

## 🚀 Next Steps

1. **Run the SQL** to create the `hero_media` table
2. **Insert sample data** to test
3. **Visit your pages** to see hero backgrounds
4. **Upload your media** to Supabase Storage (optional)
5. **Update URLs** in the database

## 💡 Tips

- **Use the Table Editor** in Supabase Dashboard for easy updates
- **Test with sample URLs** first before uploading large files
- **Keep media files small** for faster page loads
- **Use the SQL Editor** for bulk operations
- **Enable RLS** to protect your data

## 🎉 You're Connected!

The connection is already complete in your code. Just create the database table and add your media!
