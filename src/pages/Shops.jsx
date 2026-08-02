import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, ShieldCheck, Eye, MessageSquare,
  ChevronRight, Plus, X, Store, Check, Sparkles
} from 'lucide-react';
import { FEATURED_SHOPS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { fetchHeroMedia, fetchCategoryIcons } from '../lib/api';
import './Shops.css';

const CATEGORIES = ['All', 'Fertilizers', 'Pesticides', 'Seeds', 'Organic Inputs', 'Equipment', 'Soil Health', 'Bio-Fertilizers', 'Nutrients', 'Aquaculture'];

const LOGO_EMOJIS = ['🌿', '🧪', '🌱', '🌾', '🚜', '🪱', '🔬', '💧', '🏪', '🍎', '📦', '💊'];
const BANNERS = [
  { label: 'Forest Emerald', css: 'linear-gradient(135deg,#15803d,#4ade80)' },
  { label: 'Bio Teal',       css: 'linear-gradient(135deg,#0d9488,#2dd4bf)' },
  { label: 'Golden Amber',   css: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  { label: 'Deep Ocean',     css: 'linear-gradient(135deg,#1e3a8a,#3b82f6)' },
  { label: 'Royal Violet',   css: 'linear-gradient(135deg,#6b21a8,#a855f7)' },
];

function RegisterShopModal({ onClose, onSubmit, categoryIcons = {} }) {
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    logo: '🌿',
    logoColor: '#15803d',
    banner: 'linear-gradient(135deg,#15803d,#4ade80)',
    category: ['Fertilizers'],
    location: '',
    country: 'Ghana',
    phone: '',
    email: '',
    website: '',
    established: new Date().getFullYear().toString(),
    specialtiesStr: 'Fertilizers, Crop Protection, Soil Testing',
    brandsStr: 'Yara, Syngenta, Bayer',
  });

  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat) => {
    setForm(f => {
      const exists = f.category.includes(cat);
      const next = exists
        ? f.category.filter(c => c !== cat)
        : [...f.category, cat];
      return { ...f, category: next.length > 0 ? next : ['Fertilizers'] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tagline.trim() || !form.location.trim()) {
      alert('Please complete the shop name, tagline, and location.');
      return;
    }
    setLoading(true);
    try {
      const specialties = form.specialtiesStr.split(',').map(s => s.trim()).filter(Boolean);
      const brands = form.brandsStr.split(',').map(b => b.trim()).filter(Boolean);
      await onSubmit({ ...form, specialties, brands });
      onClose();
    } catch (err) {
      console.error('Failed to register shop:', err);
      alert('Failed to register shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal trade-modal animate-slideUp" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h3 className="flex items-center gap-2"><Store size={18} color="var(--primary)"/> Register Your Agro Shop</h3>
            <div className="text-sm text-secondary">Join FarmWorld's verified global supplier directory</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px 24px' }}>
          {/* Shop Name */}
          <div className="input-group">
            <label className="input-label">Shop / Company Name *</label>
            <input
              className="input"
              placeholder="e.g. Kumasi Agro-Chemical Hub Ltd"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Tagline */}
          <div className="input-group">
            <label className="input-label">Tagline / Short Summary *</label>
            <input
              className="input"
              placeholder="e.g. Authorized distributor of Yara fertilizers & Syngenta seed varieties"
              value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              required
            />
          </div>

          {/* Logo Emoji & Banner theme */}
          <div className="two-inputs">
            <div className="input-group">
              <label className="input-label">Shop Logo Icon</label>
              <div className="flex gap-2 flex-wrap" style={{ marginTop: 4 }}>
                {LOGO_EMOJIS.map(e => (
                  <button
                    type="button"
                    key={e}
                    className={`btn btn-sm ${form.logo === e ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: 16, padding: '4px 10px' }}
                    onClick={() => setForm({ ...form, logo: e })}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Banner Theme</label>
              <select
                className="input"
                value={form.banner}
                onChange={e => setForm({ ...form, banner: e.target.value })}
              >
                {BANNERS.map(b => (
                  <option key={b.css} value={b.css}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="input-group">
            <label className="input-label">Product Categories (Select all that apply)</label>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
              {CATEGORIES.slice(1).map(cat => {
                const active = form.category.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    className={`cat-pick-btn ${active ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <span>{categoryIcons[cat] || ''}</span> {cat} {active && <Check size={12}/>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Country */}
          <div className="two-inputs">
            <div className="input-group">
              <label className="input-label">City / Region *</label>
              <input
                className="input"
                placeholder="e.g. Kumasi, Ashanti Region"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Country *</label>
              <select
                className="input"
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
              >
                <option value="Ghana">🇬🇭 Ghana</option>
                <option value="Kenya">🇰🇪 Kenya</option>
                <option value="Nigeria">🇳🇬 Nigeria</option>
                <option value="Ivory Coast">🇨🇮 Ivory Coast</option>
                <option value="Senegal">🇸🇳 Senegal</option>
                <option value="Tanzania">🇹🇿 Tanzania</option>
                <option value="Uganda">🇺🇬 Uganda</option>
                <option value="Global">🌍 International / Global</option>
              </select>
            </div>
          </div>

          {/* Phone, Email & Website */}
          <div className="three-inputs">
            <div className="input-group">
              <label className="input-label">Contact Phone / WhatsApp</label>
              <input
                className="input"
                placeholder="e.g. +233 24 123 4567"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Business Email</label>
              <input
                className="input"
                type="email"
                placeholder="sales@agroshop.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Website URL</label>
              <input
                className="input"
                placeholder="e.g. https://greenfieldagro.co.ke"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          {/* Products & Specialties & Brands */}
          <div className="two-inputs">
            <div className="input-group">
              <label className="input-label">Products & Specialties (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. NPK Fertilizers, Foliar Feeds, Certified Seeds, Fungicides"
                value={form.specialtiesStr}
                onChange={e => setForm({ ...form, specialtiesStr: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Brands Stocked (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. Yara, Bayer, Syngenta, Kenya Seed Co., MEA Fertilizers"
                value={form.brandsStr}
                onChange={e => setForm({ ...form, brandsStr: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Store Description / Overview</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Describe your agro-chemical store, services, delivery options, and product authenticity guarantees…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', marginTop: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering…' : <><Sparkles size={16}/> Publish & Register Shop</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="star-row">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13} className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'} />
      ))}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

function FeaturedShopCard({ shop, onClick }) {
  return (
    <div className="featured-shop-card" onClick={onClick}>
      <div className="fsc-crown">⭐ Featured</div>
      <div className="fsc-banner" style={{ background: '#f5f5f5' }}>
        <div className="fsc-logo" style={{ background: shop.logoColor }}>{shop.logo}</div>
      </div>
      <div className="fsc-body">
        <div className="fsc-name-row">
          <h3 className="fsc-name">{shop.name}</h3>
          {shop.verified && <ShieldCheck size={15} className="fsc-check"/>}
        </div>
        <p className="fsc-tagline">{shop.tagline}</p>
        <div className="fsc-cats">
          {shop.category.map(c => <span key={c} className="fsc-cat">{c}</span>)}
        </div>
        <div className="fsc-stats-row">
          <span className="fsc-stat"><MapPin size={12}/> {shop.country}</span>
          <span className="fsc-stat"><Star size={12} className="fsc-star"/> {shop.rating}</span>
          <span className="fsc-stat"><Eye size={12}/> {shop.views.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function ShopCard({ shop, onClick, categoryIcons = {} }) {
  return (
    <div className="shop-card" onClick={onClick}>
      {/* Banner */}
      <div className="shop-card-banner" style={{ background: '#f5f5f5' }}>
        <div className="shop-logo-wrap">
          <div className="shop-logo" style={{ background: shop.logoColor }}>
            {shop.logo}
          </div>
        </div>
        {shop.verified && (
          <div className="shop-verified-badge">
            <ShieldCheck size={12}/> Verified
          </div>
        )}
      </div>

      {/* Body */}
      <div className="shop-card-body">
        <div className="shop-card-name-row">
          <h3 className="shop-card-name">{shop.name}</h3>
        </div>

        <p className="shop-card-tagline">{shop.tagline}</p>

        {/* Categories */}
        <div className="shop-cats">
          {shop.category.map(c => (
            <span key={c} className="shop-cat-chip">{categoryIcons[c] || ''} {c}</span>
          ))}
        </div>

        {/* Location */}
        <div className="shop-card-location">
          <MapPin size={13}/> {shop.location}
        </div>

        {/* Stats */}
        <div className="shop-card-stats">
          <StarRating rating={shop.rating} />
          <span className="shop-stat-sep">·</span>
          <span className="shop-stat"><Eye size={12}/> {shop.views.toLocaleString()}</span>
          <span className="shop-stat-sep">·</span>
          <span className="shop-stat"><MessageSquare size={12}/> {shop.inquiries}</span>
        </div>

        {/* Footer */}
        <div className="shop-card-footer">
          <span className="shop-est">Est. {shop.established}</span>
          <button className="shop-view-btn">
            View Shop <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}



export default function Shops() {
  const navigate = useNavigate();
  const { agroShops, registerShop } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [heroMedia, setHeroMedia] = useState(null);
  const [categoryIcons, setCategoryIcons] = useState({});

  useEffect(() => {
    fetchHeroMedia('shops').then(mediaList => {
      if (mediaList && mediaList.length > 0) {
        setHeroMedia(mediaList[0]);
      }
    });
    
    // Fetch category icons from Supabase
    fetchCategoryIcons().then(icons => {
      setCategoryIcons(icons);
    });
  }, []);

  const countries = ['All', ...new Set(agroShops.map(s => s.country))];

  const filtered = agroShops.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      (s.specialties && s.specialties.some(sp => sp.toLowerCase().includes(search.toLowerCase())));
    const matchesCat = activeCategory === 'All' || s.category.includes(activeCategory);
    const matchesCountry = country === 'All' || s.country === country;
    return matchesSearch && matchesCat && matchesCountry;
  });

  const handleRegisterShop = async (shopData) => {
    const created = await registerShop(shopData);
    if (created) {
      alert(`🎉 Congratulations! ${created.name} has been successfully registered!`);
    }
  };

  const handleSaveHeroMedia = async (mediaData) => {
    const saved = await saveHeroMedia(mediaData);
    if (saved) {
      setHeroMedia(saved);
    } else {
      setHeroMedia(mediaData);
    }
  };

  return (
    <div className="shops-page page-container">

      {/* ── Hero ── */}
      <div className="shops-hero">
        {/* Background Media (Image or Video from Supabase only) */}
        {heroMedia && heroMedia.mediaUrl && (
          <>
            {heroMedia.mediaType === 'video' ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={heroMedia.posterUrl}
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
                <source src={heroMedia.mediaUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url("${heroMedia.mediaUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 0,
                }}
              />
            )}
            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(10,15,28,0.88) 0%, rgba(10,15,28,0.6) 55%, rgba(10,15,28,0.25) 100%)',
                zIndex: 1,
              }}
            />
          </>
        )}

        <div className="shops-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="shops-hero-label">🧪 Agro-Chemical Directory</div>
          <h1 className="shops-hero-title">Find Trusted <span className="gradient-text">Agro-Input</span> Suppliers</h1>
          <p className="shops-hero-sub">Browse verified agrochemical shops, fertilizer dealers and input suppliers from across the world — all in one place on FarmWorld.</p>

          {/* Stats bar */}
          <div className="shops-hero-stats">
            <div className="shops-stat-item"><span className="shops-stat-num">{agroShops.length}</span><span className="shops-stat-label">Listed Shops</span></div>
            <div className="shops-stat-div"/>
            <div className="shops-stat-item"><span className="shops-stat-num">{agroShops.filter(s=>s.verified).length}</span><span className="shops-stat-label">Verified</span></div>
            <div className="shops-stat-div"/>
            <div className="shops-stat-item"><span className="shops-stat-num">{[...new Set(agroShops.map(s=>s.country))].length}</span><span className="shops-stat-label">Countries</span></div>
            <div className="shops-stat-div"/>
            <div className="shops-stat-item"><span className="shops-stat-num">{agroShops.reduce((a,s)=>a+(s.inquiries || 0),0)}</span><span className="shops-stat-label">Farmer Inquiries</span></div>
          </div>
        </div>

        {/* Hero Actions */}
        <button className="shops-register-btn" onClick={() => setShowRegisterModal(true)} style={{ position: 'relative', zIndex: 2 }}>
          <Plus size={18}/> Register Your Shop
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="shops-filter-bar card">
        <div className="shops-search-wrap">
          <Search size={16} className="shops-search-icon"/>
          <input
            className="shops-search-input"
            placeholder="Search by shop name, location or product type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="shops-country-select" value={country} onChange={e => setCountry(e.target.value)}>
          {countries.map(c => <option key={c} value={c}>{c === 'All' ? '🌍 All Countries' : `🏳️ ${c}`}</option>)}
        </select>
      </div>

      {/* ── Category Chips ── */}
      <div className="shops-cat-strip">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`shops-cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {categoryIcons[cat] || ''} {cat}
          </button>
        ))}
      </div>

      {/* ── Featured Shops ── */}
      {(() => {
        const featured = agroShops.filter(s => FEATURED_SHOPS.includes(s.id));
        return featured.length > 0 ? (
          <div className="featured-shops-section">
            <div className="featured-section-header">
              <div className="featured-section-left">
                <span className="featured-section-badge">⭐ Featured</span>
                <span className="featured-section-title">Featured Shops</span>
                <span className="featured-section-sub">Premium verified suppliers</span>
              </div>
              <button className="featured-section-cta" onClick={() => alert('Contact ads@farmworld.com to feature your shop')}>Feature Your Shop</button>
            </div>
            <div className="featured-shops-grid">
              {featured.map(shop => (
                <FeaturedShopCard key={shop.id} shop={shop} onClick={() => navigate(`/shops/${shop.id}`)} />
              ))}
            </div>
          </div>
        ) : null;
      })()}


      {/* ── Results count ── */}

      <div className="shops-results-row">
        <span className="shops-results-count">
          {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
          {activeCategory !== 'All' && <span className="shops-filter-active"> · {activeCategory}</span>}
          {country !== 'All' && <span className="shops-filter-active"> · {country}</span>}
        </span>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="shops-grid">
          {filtered.map(shop => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onClick={() => navigate(`/shops/${shop.id}`)}
              categoryIcons={categoryIcons}
            />
          ))}
        </div>
      ) : (
        <div className="shops-empty">
          <div className="shops-empty-icon">🏪</div>
          <h3>No shops found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Register Shop Modal */}
      {showRegisterModal && (
        <RegisterShopModal
          onClose={() => setShowRegisterModal(false)}
          onSubmit={handleRegisterShop}
          categoryIcons={categoryIcons}
        />
      )}
    </div>
  );
}
