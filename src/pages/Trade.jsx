import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, MapPin, Scale, Calendar, ShieldCheck,
  Leaf, Globe, Filter, TrendingUp, ArrowUpRight, ArrowDownLeft,
  X, Handshake, Star, Package,
  Wheat, Apple, Beef, Droplets, Flame, Sprout, Tag, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchHeroMedia } from '../lib/api';
import './Trade.css';

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',                 icon: Globe,   emoji: '🌍' },
  { label: 'Grains',              icon: Wheat,   emoji: '🌾' },
  { label: 'Fruits',              icon: Apple,   emoji: '🍎' },
  { label: 'Vegetables',          icon: Sprout,  emoji: '🥦' },
  { label: 'Cash Crops',          icon: Leaf,    emoji: '☕' },
  { label: 'Nuts & Seeds',        icon: Package, emoji: '🥜' },
  { label: 'Spices',              icon: Flame,   emoji: '🌶️' },
  { label: 'Livestock & Poultry', icon: Beef,    emoji: '🐄' },
  { label: 'Oils & Fats',         icon: Droplets,emoji: '🛢️' },
];

const CERT_COLORS = {
  'Organic':     { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'Fair Trade':  { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
  'HACCP':       { bg: 'rgba(0,168,220,0.15)',  color: '#00A8E0', border: 'rgba(0,168,220,0.3)' },
  'GlobalG.A.P.':{ bg: 'rgba(245,158,11,0.15)',color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
};

const UNITS = ['tons', 'kg', 'bags', 'crates', 'litres', 'pieces'];

// ─── Post Listing Modal ────────────────────────────────────────────────────
function PostListingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: 'sell', product: '', category: 'Grains',
    quantity: '', unit: 'tons', location: '',
    priceMin: '', priceMax: '', currency: 'USD', perUnit: 'ton',
    deadline: '', description: '',
    certifications: [],
  });
  const [step, setStep] = useState(1);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleCert = (c) => setForm(f => ({
    ...f,
    certifications: f.certifications.includes(c)
      ? f.certifications.filter(x => x !== c)
      : [...f.certifications, c],
  }));

  const isStep1Valid = form.product.trim() && form.category && form.quantity && form.location;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal trade-modal animate-slideUp">
        <div className="modal-header">
          <div>
            <h3>Post a Trade Listing</h3>
            <div className="text-sm text-secondary">Step {step} of 2</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Progress */}
        <div className="trade-modal-progress">
          <div className="trade-progress-bar" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        <div className="modal-body trade-modal-body">
          {step === 1 && (
            <>
              {/* Type toggle */}
              <div className="listing-type-toggle">
                <button
                  className={`type-btn ${form.type === 'sell' ? 'active sell' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'sell' }))}
                >
                  <ArrowUpRight size={18}/> I Have — Sell / Export
                </button>
                <button
                  className={`type-btn ${form.type === 'buy' ? 'active buy' : ''}`}
                  onClick={() => setForm(f => ({ ...f, type: 'buy' }))}
                >
                  <ArrowDownLeft size={18}/> I Need — Buy / Import
                </button>
              </div>

              {/* Product */}
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input className="input" placeholder="e.g. White Maize, Hass Avocado…" value={form.product} onChange={update('product')} />
              </div>

              {/* Category */}
              <div className="input-group">
                <label className="input-label">Category *</label>
                <div className="category-pick-grid">
                  {CATEGORIES.slice(1).map(c => (
                    <button
                      key={c.label}
                      className={`cat-pick-btn ${form.category === c.label ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, category: c.label }))}
                    >
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Unit */}
              <div className="two-inputs">
                <div className="input-group">
                  <label className="input-label">Quantity *</label>
                  <input className="input" type="number" min="1" placeholder="e.g. 500" value={form.quantity} onChange={update('quantity')} />
                </div>
                <div className="input-group">
                  <label className="input-label">Unit</label>
                  <select className="input" value={form.unit} onChange={update('unit')}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="input-group">
                <label className="input-label">Location / Country *</label>
                <input className="input" placeholder="e.g. Nairobi, Kenya" value={form.location} onChange={update('location')} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Price */}
              <div className="input-group">
                <label className="input-label">Price Range (optional)</label>
                <div className="three-inputs">
                  <input className="input" type="number" placeholder="Min" value={form.priceMin} onChange={update('priceMin')} />
                  <span className="text-muted" style={{ alignSelf: 'center' }}>–</span>
                  <input className="input" type="number" placeholder="Max" value={form.priceMax} onChange={update('priceMax')} />
                  <select className="input" value={form.currency} onChange={update('currency')} style={{ maxWidth: 80 }}>
                    {['USD','EUR','GBP','KES','GHS','NGN','ETB'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="text-xs text-muted" style={{ marginTop: 4 }}>Leave blank to negotiate privately</div>
              </div>

              {/* Deadline */}
              <div className="input-group">
                <label className="input-label">{form.type === 'sell' ? 'Available Until' : 'Needed By'}</label>
                <input className="input" type="date" value={form.deadline} onChange={update('deadline')} />
              </div>

              {/* Certifications */}
              <div className="input-group">
                <label className="input-label">Certifications</label>
                <div className="cert-toggle-row">
                  {Object.keys(CERT_COLORS).map(c => (
                    <button
                      key={c}
                      className={`cert-toggle ${form.certifications.includes(c) ? 'active' : ''}`}
                      style={form.certifications.includes(c) ? { background: CERT_COLORS[c].bg, borderColor: CERT_COLORS[c].border, color: CERT_COLORS[c].color } : {}}
                      onClick={() => toggleCert(c)}
                    >
                      {form.certifications.includes(c) && <ShieldCheck size={12}/>} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Describe quality specs, packaging, delivery terms, preferred buyer/supplier country…"
                  value={form.description}
                  onChange={update('description')}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {step === 2 && <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {step === 1 ? (
            <button className="btn btn-primary" disabled={!isStep1Valid} onClick={() => setStep(2)}>
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!form.description.trim()}
              onClick={() => onSave({
                ...form,
                quantity: Number(form.quantity),
                priceMin: form.priceMin ? Number(form.priceMin) : null,
                priceMax: form.priceMax ? Number(form.priceMax) : null,
                perUnit: form.unit === 'tons' ? 'ton' : form.unit,
              })}
            >
              <Plus size={15}/> Post Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Listing Detail Modal ──────────────────────────────────────────────────
function ListingDetailModal({ listing, onClose, onInterest, currentUser }) {
  const navigate = useNavigate();
  const isMe = listing.poster.id === currentUser.id;
  const isBuy = listing.type === 'buy';

  const handleConnect = () => {
    onInterest(listing.id);
    onClose();
    navigate('/messaging');
  };

  const formatPrice = (l) => {
    if (!l.priceMin && !l.priceMax) return 'Negotiable';
    const fmt = (n) => n ? `${l.currency} ${n.toLocaleString()}` : '';
    if (l.priceMin && l.priceMax) return `${fmt(l.priceMin)} – ${fmt(l.priceMax)} / ${l.perUnit}`;
    return `${fmt(l.priceMin || l.priceMax)} / ${l.perUnit}`;
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal trade-detail-modal animate-slideUp">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <span className={`type-badge large ${isBuy ? 'buy' : 'sell'}`}>
              {isBuy ? <><ArrowDownLeft size={16}/> IMPORT / BUY</> : <><ArrowUpRight size={16}/> EXPORT / SELL</>}
            </span>
            {listing.verified && <span className="verified-badge"><ShieldCheck size={13}/> Verified</span>}
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>

        <div className="modal-body trade-detail-body">
          <h2 style={{ marginBottom: 6 }}>{listing.product}</h2>
          <div className="text-secondary" style={{ marginBottom: 20 }}>{listing.category}</div>

          <div className="detail-stats-grid">
            <div className="detail-stat"><Scale size={16} color="var(--primary-light)"/><div><div className="detail-stat-label">Quantity</div><div className="detail-stat-val">{listing.quantity.toLocaleString()} {listing.unit}</div></div></div>
            <div className="detail-stat"><MapPin size={16} color="#10b981"/><div><div className="detail-stat-label">Location</div><div className="detail-stat-val">{listing.location}</div></div></div>
            <div className="detail-stat"><Tag size={16} color="#f59e0b"/><div><div className="detail-stat-label">Price</div><div className="detail-stat-val">{formatPrice(listing)}</div></div></div>
            <div className="detail-stat"><Calendar size={16} color="#ec4899"/><div><div className="detail-stat-label">{isBuy ? 'Needed by' : 'Available until'}</div><div className="detail-stat-val">{listing.deadline || '—'}</div></div></div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Description</label>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>{listing.description}</p>
          </div>

          {listing.certifications.length > 0 && (
            <div>
              <div className="input-label" style={{ marginBottom: 8 }}>Certifications</div>
              <div className="cert-row">
                {listing.certifications.map(c => (
                  <span key={c} className="cert-pill" style={{ background: CERT_COLORS[c]?.bg, color: CERT_COLORS[c]?.color, border: `1px solid ${CERT_COLORS[c]?.border}` }}>
                    <ShieldCheck size={11}/> {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-poster-card">
            <div className="avatar avatar-md" style={{ background: listing.poster.color }}>{listing.poster.initials}</div>
            <div>
              <div className="font-600">{listing.poster.name}</div>
              <div className="text-sm text-secondary">{listing.poster.headline}</div>
              <div className="text-xs text-muted"><Users size={11} style={{ display:'inline', marginRight:4 }}/>{listing.interested} {listing.interested === 1 ? 'trader' : 'traders'} interested</div>
            </div>
          </div>
        </div>

        {!isMe && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={handleConnect}>
              <Handshake size={16}/> {isBuy ? 'I Can Supply This' : 'Meet This Demand'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Trade Listing Card ────────────────────────────────────────────────────
function TradeCard({ listing, onClick, onInterest, currentUser }) {
  const isBuy = listing.type === 'buy';
  const isMe = listing.poster.id === currentUser.id;
  const catData = CATEGORIES.find(c => c.label === listing.category) || CATEGORIES[0];

  const formatPrice = (l) => {
    if (!l.priceMin && !l.priceMax) return 'Negotiable';
    if (l.priceMin && l.priceMax) return `${l.currency} ${l.priceMin.toLocaleString()}–${l.priceMax.toLocaleString()}/${l.perUnit}`;
    return `${l.currency} ${(l.priceMin || l.priceMax).toLocaleString()}/${l.perUnit}`;
  };

  return (
    <div className="trade-card card" onClick={() => onClick(listing)}>
      {/* Header row */}
      <div className="trade-card-header">
        <div className="flex items-center gap-2">
          <span className={`type-badge ${isBuy ? 'buy' : 'sell'}`}>
            {isBuy ? <><ArrowDownLeft size={12}/> BUY</> : <><ArrowUpRight size={12}/> SELL</>}
          </span>
          <span className="cat-emoji-badge">{catData.emoji} {listing.category}</span>
        </div>
        {listing.verified && (
          <span className="verified-mini" title="Verified Trader"><ShieldCheck size={14} color="#10b981"/></span>
        )}
      </div>

      {/* Product */}
      <h3 className="trade-product-name">{listing.product}</h3>

      {/* Key specs */}
      <div className="trade-specs">
        <div className="spec-item"><Scale size={13}/> {listing.quantity.toLocaleString()} {listing.unit}</div>
        <div className="spec-item"><MapPin size={13}/> {listing.location}</div>
        <div className="spec-item"><Tag size={13}/> {formatPrice(listing)}</div>
        {listing.deadline && <div className="spec-item"><Calendar size={13}/> {listing.deadline}</div>}
      </div>

      {/* Description snippet */}
      <p className="trade-desc">{listing.description.slice(0, 120)}{listing.description.length > 120 ? '…' : ''}</p>

      {/* Certifications */}
      {listing.certifications.length > 0 && (
        <div className="cert-row">
          {listing.certifications.map(c => (
            <span key={c} className="cert-pill" style={{ background: CERT_COLORS[c]?.bg, color: CERT_COLORS[c]?.color, border: `1px solid ${CERT_COLORS[c]?.border}` }}>
              <ShieldCheck size={10}/> {c}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="trade-card-footer">
        <div className="trade-poster">
          <div className="avatar avatar-sm" style={{ background: listing.poster.color }}>{listing.poster.initials}</div>
          <div>
            <div className="text-sm font-600">{listing.poster.name}</div>
            <div className="text-xs text-muted">{listing.postedDate}</div>
          </div>
        </div>
        <div className="trade-card-actions">
          <button
            className="interested-btn"
            onClick={e => { e.stopPropagation(); onInterest(listing.id); }}
            title="Mark interested"
          >
            <Star size={13} className={listing._iInterested ? 'starred' : ''}/> {listing.interested}
          </button>
          {!isMe && (
            <button
              className={`btn btn-sm ${isBuy ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={e => { e.stopPropagation(); onInterest(listing.id); }}
            >
              <Handshake size={13}/> {isBuy ? 'I Can Supply' : 'I Want This'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Trade Page ───────────────────────────────────────────────────────
export default function Trade() {
  const { tradeListings, createListing, toggleInterestedListing, user } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'buy' | 'sell'
  const [sortBy, setSortBy] = useState('newest');
  const [showPost, setShowPost] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [heroMedia, setHeroMedia] = useState(null);

  useEffect(() => {
    fetchHeroMedia('trade').then(mediaList => {
      if (mediaList && mediaList.length > 0) {
        setHeroMedia(mediaList[0]);
      }
    });
  }, []);

  // Derived stats
  const buyCount  = tradeListings.filter(l => l.type === 'buy').length;
  const sellCount = tradeListings.filter(l => l.type === 'sell').length;
  const countries = new Set(tradeListings.map(l => l.location.split(',').pop().trim())).size;
  const totalInterested = tradeListings.reduce((a, l) => a + l.interested, 0);

  // Filter + sort
  let filtered = tradeListings
    .filter(l => {
      const matchSearch = l.product.toLowerCase().includes(search.toLowerCase()) ||
        l.location.toLowerCase().includes(search.toLowerCase()) ||
        l.poster.name.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || l.category === activeCategory;
      const matchType = typeFilter === 'all' || l.type === typeFilter;
      return matchSearch && matchCat && matchType;
    });

  if (sortBy === 'newest') filtered = [...filtered]; // already in posted order
  else if (sortBy === 'interested') filtered = [...filtered].sort((a,b) => b.interested - a.interested);
  else if (sortBy === 'quantity') filtered = [...filtered].sort((a,b) => b.quantity - a.quantity);

  const handlePost = (data) => { createListing(data); setShowPost(false); };

  return (
    <div className="trade-page">
      {/* ── Hero Banner ── */}
      <div className="trade-hero">
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
                className="trade-hero-media"
              >
                <source src={heroMedia.mediaUrl} type="video/mp4" />
              </video>
            ) : (
              <div
                className="trade-hero-media"
                style={{
                  backgroundImage: `url("${heroMedia.mediaUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </>
        )}
        <div className="trade-hero-bg" />
        <div className="trade-hero-content page-container">
          <div className="trade-hero-text">
            <div className="trade-hero-label">🌾 Agricultural Trade Portal</div>
            <h1 className="trade-hero-title">Import & Export<br/><span className="gradient-text">Marketplace</span></h1>
            <p className="trade-hero-sub">FarmWorld connects farmers, exporters and importers from every continent. Post your supply or demand — and let the world's agricultural community come to you.</p>
            <div className="trade-hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setShowPost(true)}>
                <Plus size={18}/> Post a Listing
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => document.getElementById('trade-board').scrollIntoView({ behavior: 'smooth' })}>
                Browse Listings ↓
              </button>
            </div>
          </div>

          {/* Live stats */}
          <div className="trade-hero-stats">
            {[
              { label: 'Active Listings', val: tradeListings.length, icon: '📋' },
              { label: 'Import (Buy)', val: buyCount, icon: '📥' },
              { label: 'Export (Sell)', val: sellCount, icon: '📤' },
              { label: 'Countries', val: countries, icon: '🌍' },
              { label: 'Trader Matches', val: totalInterested, icon: '🤝' },
            ].map(s => (
              <div key={s.label} className="hero-stat-card">
                <div className="hero-stat-icon">{s.icon}</div>
                <div className="hero-stat-val">{s.val}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Board ── */}
      <div className="page-container" id="trade-board">
        {/* Category filter strip */}
        <div className="category-strip">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className={`cat-chip ${activeCategory === cat.label ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="trade-filter-bar card">
          <div className="trade-search-wrap">
            <Search size={15} className="trade-search-icon" />
            <input
              className="input trade-search-input"
              placeholder="Search product, location, trader…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type toggle */}
          <div className="type-filter-group">
            {[
              { val: 'all',  label: '🌍 All' },
              { val: 'buy',  label: '📥 Import / Buy' },
              { val: 'sell', label: '📤 Export / Sell' },
            ].map(t => (
              <button
                key={t.val}
                className={`type-filter-chip ${typeFilter === t.val ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.val)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="sort-wrap">
            <Filter size={14} color="var(--text-muted)"/>
            <select className="input sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="interested">Most Interested</option>
              <option value="quantity">Largest Quantity</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => setShowPost(true)}>
            <Plus size={15}/> Post Listing
          </button>
        </div>

        {/* Results count */}
        <div className="trade-results-row">
          <span className="text-secondary text-sm">
            <TrendingUp size={14} style={{ display:'inline', marginRight:6 }}/>
            Showing <strong style={{ color:'var(--text-primary)' }}>{filtered.length}</strong> of {tradeListings.length} listings
          </span>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="trade-grid">
            {filtered.map(listing => (
              <TradeCard
                key={listing.id}
                listing={listing}
                currentUser={user}
                onClick={setSelectedListing}
                onInterest={toggleInterestedListing}
              />
            ))}
          </div>
        ) : (
          <div className="trade-empty">
            <div className="trade-empty-icon">🌾</div>
            <h3>No listings found</h3>
            <p>Try a different category or search term, or be the first to post!</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowPost(true)}>
              <Plus size={15}/> Post a Listing
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPost && <PostListingModal onClose={() => setShowPost(false)} onSave={handlePost} />}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          currentUser={user}
          onClose={() => setSelectedListing(null)}
          onInterest={toggleInterestedListing}
        />
      )}
    </div>
  );
}
