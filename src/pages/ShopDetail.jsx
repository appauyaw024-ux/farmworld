import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, MessageSquare,
  ShieldCheck, Star, Eye, Clock, Building2, Tag,
  ExternalLink, ChevronRight, Share2
} from 'lucide-react';
import { AGRO_SHOPS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { incrementShopViews, incrementShopInquiries } from '../lib/api';
import './ShopDetail.css';

function StarRating({ rating, reviews }) {
  return (
    <div className="sd-star-row">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={16}
          className={n <= Math.round(rating) ? 'sd-star-filled' : 'sd-star-empty'}
        />
      ))}
      <span className="sd-rating-num">{rating.toFixed(1)}</span>
      <span className="sd-rating-reviews">({reviews} reviews)</span>
    </div>
  );
}

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agroShops } = useApp() || {};

  const shop = (agroShops || AGRO_SHOPS).find(s => s.id === id);

  useEffect(() => {
    if (shop?.id) {
      incrementShopViews(shop.id);
    }
  }, [shop?.id]);

  if (!shop) {
    return (
      <div className="page-container sd-not-found">
        <div className="sd-nf-icon">🏪</div>
        <h2>Shop not found</h2>
        <p>Shop ID: {id}</p>
        <button className="btn btn-primary" onClick={() => navigate('/shops')}>
          ← Back to Directory
        </button>
      </div>
    );
  }

  const handleVisitWebsite = () => {
    if (shop.website) {
      window.open(shop.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMessage = () => {
    incrementShopInquiries(shop.id);
    navigate('/messaging');
  };

  const handleWhatsApp = () => {
    incrementShopInquiries(shop.id);
    const number = (shop.whatsapp || shop.phone || '').replace(/\s+/g, '').replace('+', '');
    if (number) {
      window.open(`https://wa.me/${number}?text=Hi ${shop.name}, I found your shop on FarmWorld and would like to inquire about your products.`, '_blank');
    }
  };

  return (
    <div className="sd-page">

      {/* ── Banner ── */}
      <div className="sd-banner" style={{ background: '#f5f5f5' }}>
        <button className="sd-back-btn" onClick={() => navigate('/shops')}>
          <ArrowLeft size={18}/> All Shops
        </button>

        {shop.verified && (
          <div className="sd-verified">
            <ShieldCheck size={14}/> Verified Seller
          </div>
        )}
      </div>

      {/* ── Header Card ── */}
      <div className="page-container">
        <div className="sd-header-card card">
          <div className="sd-header-top">
            <div className="sd-logo-wrap">
              <div className="sd-logo" style={{ background: shop.logoColor }}>
                {shop.logo}
              </div>
            </div>

            <div className="sd-header-actions">
              <button className="sd-share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <Share2 size={16}/> Share
              </button>
              <button className="sd-msg-btn" onClick={handleMessage}>
                <MessageSquare size={16}/> Message on FarmWorld
              </button>
              {shop.website && (
                <button className="sd-visit-btn" onClick={handleVisitWebsite}>
                  <Globe size={16}/> Visit Shop <ExternalLink size={13}/>
                </button>
              )}
            </div>
          </div>

          <div className="sd-header-info">
            <div className="sd-name-row">
              <h1 className="sd-name">{shop.name}</h1>
              {shop.verified && <ShieldCheck size={18} className="sd-check-icon"/>}
            </div>
            <p className="sd-tagline">{shop.tagline}</p>

            <StarRating rating={shop.rating} reviews={shop.reviews} />

            <div className="sd-meta-row">
              <span className="sd-meta-item">
                <MapPin size={14}/> {shop.location}
              </span>
              {shop.openHours && (
                <>
                  <span className="sd-meta-sep">·</span>
                  <span className="sd-meta-item">
                    <Clock size={14}/> {shop.openHours}
                  </span>
                </>
              )}
              {shop.established && (
                <>
                  <span className="sd-meta-sep">·</span>
                  <span className="sd-meta-item">
                    <Building2 size={14}/> Est. {shop.established}
                  </span>
                </>
              )}
            </div>

            {/* Categories */}
            {shop.category && shop.category.length > 0 && (
              <div className="sd-cats">
                {shop.category.map(c => (
                  <span key={c} className="sd-cat-chip">{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="sd-quick-stats">
            <div className="sd-qs-item">
              <Eye size={20} className="sd-qs-icon"/>
              <span className="sd-qs-num">{(shop.views || 0).toLocaleString()}</span>
              <span className="sd-qs-label">Profile Views</span>
            </div>
            <div className="sd-qs-div"/>
            <div className="sd-qs-item">
              <MessageSquare size={20} className="sd-qs-icon"/>
              <span className="sd-qs-num">{shop.inquiries || 0}</span>
              <span className="sd-qs-label">Farmer Inquiries</span>
            </div>
            <div className="sd-qs-div"/>
            <div className="sd-qs-item">
              <Tag size={20} className="sd-qs-icon"/>
              <span className="sd-qs-num">{(shop.specialties || []).length}</span>
              <span className="sd-qs-label">Specialties</span>
            </div>
            <div className="sd-qs-div"/>
            <div className="sd-qs-item">
              <Star size={20} className="sd-qs-icon"/>
              <span className="sd-qs-num">{shop.rating || 0}</span>
              <span className="sd-qs-label">Avg Rating</span>
            </div>
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="sd-content-grid">

          {/* LEFT — Main content */}
          <div className="sd-main">

            {/* About */}
            <div className="card sd-section">
              <h2 className="sd-section-title">🏪 About {shop.name}</h2>
              <p className="sd-about-text">{shop.description}</p>
            </div>

            {/* Specialties */}
            {shop.specialties && shop.specialties.length > 0 && (
              <div className="card sd-section">
                <h2 className="sd-section-title">🧪 Products & Specialties</h2>
                <p className="sd-section-sub">This shop specialises in the following agro-chemical products and services:</p>
                <div className="sd-specialties-grid">
                  {shop.specialties.map((s, i) => (
                    <div key={i} className="sd-specialty-item">
                      <ChevronRight size={14} className="sd-sp-arrow"/>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {shop.brands && shop.brands.length > 0 && (
              <div className="card sd-section">
                <h2 className="sd-section-title">🏷️ Brands Stocked</h2>
                <div className="sd-brands-wrap">
                  {shop.brands.map((b, i) => (
                    <span key={i} className="sd-brand-chip">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Visit Website CTA */}
            {shop.website && (
              <div className="sd-website-cta" onClick={handleVisitWebsite}>
                <div className="sd-cta-left">
                  <Globe size={28} className="sd-cta-icon"/>
                  <div>
                    <div className="sd-cta-title">Browse All Products Online</div>
                    <div className="sd-cta-url">{shop.website}</div>
                  </div>
                </div>
                <button className="sd-cta-btn">
                  Visit Shop <ExternalLink size={14}/>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Contact sidebar */}
          <div className="sd-sidebar">

            {/* Contact Card */}
            <div className="card sd-contact-card">
              <h3 className="sd-contact-title">📞 Contact This Shop</h3>

              <div className="sd-contact-list">
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="sd-contact-item">
                    <div className="sd-contact-icon-wrap phone">
                      <Phone size={16}/>
                    </div>
                    <div>
                      <div className="sd-contact-label">Phone</div>
                      <div className="sd-contact-val">{shop.phone}</div>
                    </div>
                  </a>
                )}

                {shop.whatsapp && (
                  <div className="sd-contact-item" onClick={handleWhatsApp} style={{cursor:'pointer'}}>
                    <div className="sd-contact-icon-wrap whatsapp">
                      <MessageSquare size={16}/>
                    </div>
                    <div>
                      <div className="sd-contact-label">WhatsApp</div>
                      <div className="sd-contact-val">{shop.whatsapp}</div>
                    </div>
                  </div>
                )}

                {shop.email && (
                  <a href={`mailto:${shop.email}`} className="sd-contact-item">
                    <div className="sd-contact-icon-wrap email">
                      <Mail size={16}/>
                    </div>
                    <div>
                      <div className="sd-contact-label">Email</div>
                      <div className="sd-contact-val">{shop.email}</div>
                    </div>
                  </a>
                )}

                {shop.website && (
                  <div className="sd-contact-item" onClick={handleVisitWebsite} style={{cursor:'pointer'}}>
                    <div className="sd-contact-icon-wrap website">
                      <Globe size={16}/>
                    </div>
                    <div>
                      <div className="sd-contact-label">Website</div>
                      <div className="sd-contact-val sd-website-val">{shop.website.replace('https://', '')}</div>
                    </div>
                  </div>
                )}
              </div>

              <button className="sd-farmworld-msg-btn" onClick={handleMessage}>
                <MessageSquare size={16}/> Message on FarmWorld
              </button>

              <button className="sd-whatsapp-btn" onClick={handleWhatsApp}>
                <img src="/whatsapp-icon.png" alt="WhatsApp" style={{ width: '20px', height: '20px' }} />
                Chat on WhatsApp
              </button>
            </div>

            {/* Location Card */}
            <div className="card sd-location-card">
              <h3 className="sd-contact-title">📍 Location</h3>
              <div className="sd-location-map-placeholder">
                <MapPin size={32} className="sd-map-pin"/>
                <div className="sd-location-text">
                  <div className="sd-location-name">{shop.location}</div>
                  {shop.county && shop.country && (
                    <div className="sd-location-county">{shop.county}, {shop.country}</div>
                  )}
                </div>
              </div>
              {shop.openHours && (
                <div className="sd-hours-wrap">
                  <Clock size={14} className="sd-hours-icon"/>
                  <span className="sd-hours-text">{shop.openHours}</span>
                </div>
              )}
            </div>

            {/* Back to directory */}
            <button className="sd-back-to-dir" onClick={() => navigate('/shops')}>
              <ArrowLeft size={14}/> Back to Shop Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
