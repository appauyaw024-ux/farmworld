import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, TrendingUp, UserPlus, ThumbsUp, MessageCircle, Megaphone, Star, ExternalLink, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { SPONSORED_ADS } from '../data/mockData';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import './Feed.css';

/* ── Sponsored Post Card (native-looking) ──────────────────── */
function SponsoredPostCard({ ad }) {
  return (
    <div className="sponsored-post card">
      {/* Header */}
      <div className="sp-header">
        <div className="sp-avatar" style={{ background: ad.advertiserColor }}>
          {ad.advertiserLogo}
        </div>
        <div className="sp-info">
          <div className="sp-name">{ad.advertiser}</div>
          <div className="sp-meta">{ad.advertiserHeadline}</div>
          <div className="sp-tag">
            <Megaphone size={10}/> {ad.tag}
          </div>
        </div>
        <button className="sp-dismiss" title="Hide ad">
          <X size={14}/>
        </button>
      </div>

      {/* Content */}
      <div className="sp-body">
        <div className="sp-headline">{ad.headline}</div>
        <p className="sp-text">{ad.body}</p>
      </div>

      {/* CTA */}
      <a href={ad.ctaUrl} className="sp-cta-btn">
        {ad.cta} <ExternalLink size={13}/>
      </a>

      {/* Engagement row */}
      <div className="sp-engage">
        <div className="sp-engage-left">
          <span className="sp-engage-stat"><ThumbsUp size={13}/> {ad.likes.toLocaleString()}</span>
          <span className="sp-engage-stat"><MessageCircle size={13}/> {ad.comments}</span>
        </div>
        <span className="sp-why">Why am I seeing this?</span>
      </div>
    </div>
  );
}

/* ── Sidebar Ad Banner ─────────────────────────────────────── */
function SidebarAdBanner({ ad }) {
  return (
    <div className="sidebar-ad-banner" style={{ '--ad-color': ad.accentColor }}>
      <div className="sab-tag"><Megaphone size={10}/> {ad.tag}</div>
      <div className="sab-header">
        <span className="sab-logo">{ad.advertiserLogo}</span>
        <span className="sab-advertiser">{ad.advertiser}</span>
      </div>
      <div className="sab-headline">{ad.headline}</div>
      <p className="sab-subtext">{ad.subtext}</p>
      <a href={ad.ctaUrl} className="sab-cta">{ad.cta} →</a>
    </div>
  );
}

/* ── Profile Mini Sidebar ──────────────────────────────────── */
function ProfileSidebar({ user }) {
  return (
    <aside className="sidebar-sticky">
      <div className="card profile-mini-card">
        <div className="profile-mini-banner" />
        <div className="profile-mini-avatar">
          <div className="avatar avatar-lg" style={{ background: user.avatarColor }}>{user.initials}</div>
        </div>
        <div className="profile-mini-info">
          <Link to="/profile/me" className="profile-mini-name">{user.name}</Link>
          <p className="text-sm text-secondary">{user.headline}</p>
          <div className="flex items-center gap-2 text-muted text-sm" style={{ marginTop: 6 }}>
            <MapPin size={13} /> {user.location}
          </div>
        </div>
        <hr className="divider" style={{ margin: '12px 0' }} />
        <div className="profile-mini-stats">
          <div className="stat-row"><span className="text-secondary text-sm">Profile viewers</span><span className="stat-val">324</span></div>
          <div className="stat-row"><span className="text-secondary text-sm">Post impressions</span><span className="stat-val">2,841</span></div>
          <div className="stat-row"><span className="text-secondary text-sm">Connections</span><span className="stat-val text-primary-light">{user.connections.toLocaleString()}</span></div>
        </div>
        <hr className="divider" style={{ margin: '12px 0' }} />
        <Link to="/profile/me" className="view-profile-link">View full profile →</Link>
      </div>
    </aside>
  );
}

/* ── Suggestions + Ads Sidebar ─────────────────────────────── */
function SuggestionsSidebar({ suggestions, connect }) {
  const navigate = useNavigate();
  const sidebarAds = SPONSORED_ADS.filter(a => a.type === 'sidebar_banner');

  return (
    <aside className="sidebar-sticky">
      {/* Farmers Near You */}
      <div className="card suggestions-card">
        <div className="section-header">
          <span className="section-title">Farmers Near You 🌍</span>
          <TrendingUp size={18} color="var(--primary-light)" />
        </div>
        <div className="suggestions-list">
          {suggestions.slice(0, 5).map(s => (
            <div key={s.id} className="suggestion-item">
              <div className="avatar avatar-md" style={{ background: s.avatarColor }}>{s.initials}</div>
              <div className="suggestion-info">
                <div className="suggestion-name">{s.name}</div>
                <div className="text-xs text-secondary" style={{ marginBottom: 2 }}>{s.headline}</div>
                <div className="text-xs text-muted"><Users size={11} style={{display:'inline',marginRight:4}}/>{s.mutualConnections} mutual connections</div>
              </div>
              <button className="btn btn-outline btn-sm connect-btn" onClick={() => connect(s.id)}>
                <UserPlus size={14} /> Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Ad Banners */}
      {sidebarAds.map(ad => (
        <SidebarAdBanner key={ad.id} ad={ad} />
      ))}

      {/* Trending topics */}
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Trending Now</div>
        {['#AgriTech2025', '#SustainableFarming', '#FarmToTable', '#CropScience', '#AgriExport'].map(tag => (
          <div key={tag} className="trending-tag">
            <span className="tag-label">{tag}</span>
            <span className="text-xs text-muted">{Math.floor(Math.random()*5+1)}K posts</span>
          </div>
        ))}
      </div>

      {/* Advertise with FarmWorld CTA */}
      <div className="advertise-cta-card">
        <div className="adv-cta-icon"><Megaphone size={22}/></div>
        <div className="adv-cta-text">
          <div className="adv-cta-title">Advertise on FarmWorld</div>
          <div className="adv-cta-sub">Reach 100K+ active farmers worldwide</div>
        </div>
        <button className="adv-cta-btn" onClick={() => alert('Advertising enquiries: ads@farmworld.com')}>
          Get Started
        </button>
      </div>

      {/* Shop Directory Promo */}
      <div className="shops-promo-card" onClick={() => navigate('/shops')}>
        <ShoppingBag size={20} className="shops-promo-icon"/>
        <div>
          <div className="shops-promo-title">Agro-Input Directory</div>
          <div className="shops-promo-sub">Find certified agro-chemical suppliers near you</div>
        </div>
        <span className="shops-promo-arrow">→</span>
      </div>
    </aside>
  );
}

/* ── Feed Page ─────────────────────────────────────────────── */
export default function Feed() {
  const { user, posts, suggestions, connect } = useApp();
  const feedAds = SPONSORED_ADS.filter(a => a.type === 'feed_post');
  const [heroMedia, setHeroMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch hero media from Supabase
  useEffect(() => {
    async function fetchHeroMedia() {
      try {
        const { data, error } = await supabase
          .from('hero_media')
          .select('*')
          .eq('page', 'feed')
          .eq('is_active', true)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors if no row exists

        if (error) {
          console.error('Error fetching hero media:', error);
          // Continue with default content if error
        } else if (data) {
          console.log('Hero media loaded:', data);
          setHeroMedia(data);
        } else {
          console.log('No active hero media found for feed page');
        }
      } catch (err) {
        console.error('Failed to fetch hero media:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroMedia();
  }, []);

  // Interleave sponsored posts into feed: after post 1 and post 3
  const feedItems = [];
  posts.forEach((post, i) => {
    feedItems.push({ type: 'post', data: post });
    if (i === 1 && feedAds[0]) feedItems.push({ type: 'ad', data: feedAds[0] });
    if (i === 3 && feedAds[1]) feedItems.push({ type: 'ad', data: feedAds[1] });
  });

  return (
    <div className="page-container">
      <div className="three-col-grid">
        <ProfileSidebar user={user} />

        {/* Main Feed */}
        <main className="feed-main">
          {/* Welcome banner with hero media */}
          <div className="feed-welcome-banner" style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '200px',
            ...(heroMedia?.media_url && {
              backgroundImage: `url(${heroMedia.media_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            })
          }}>
            {/* Video overlay if media_type is video */}
            {heroMedia?.media_type === 'video' && heroMedia?.media_url && (
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                }}
              >
                <source src={heroMedia.media_url} type="video/mp4" />
              </video>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
            <CreatePost />
          </div>

          {feedItems.map((item, i) =>
            item.type === 'post'
              ? <PostCard key={item.data.id} post={item.data} />
              : <SponsoredPostCard key={item.data.id} ad={item.data} />
          )}
        </main>

        <SuggestionsSidebar suggestions={suggestions} connect={connect} />
      </div>
    </div>
  );
}
