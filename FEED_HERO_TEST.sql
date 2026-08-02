-- ============================================================
-- TEST HERO MEDIA FOR FEED PAGE
-- ============================================================
-- Run this in Supabase SQL Editor to test the Feed hero
-- ============================================================

-- First, delete any existing feed hero (optional)
DELETE FROM hero_media WHERE page = 'feed';

-- Insert test hero with image
INSERT INTO hero_media (
  page,
  media_type,
  media_url,
  title,
  subtitle,
  badge_label,
  is_active,
  display_order
) VALUES (
  'feed',
  'image',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
  'Welcome to FarmWorld',
  'Connect, Share, Grow Together',
  'New Platform',
  true,
  1
);

-- Query to verify it was inserted
SELECT * FROM hero_media WHERE page = 'feed';
