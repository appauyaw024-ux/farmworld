import { useState } from 'react';
import {
  UserCheck, UserPlus, Users, Link2,
  Layers, Calendar, BookOpen, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Network.css';

/* Banner colours per person — deterministic from id */
const BANNERS = [
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
  'linear-gradient(135deg,#e5e7eb,#f3f4f6)',
];

/* ── Manage-my-network sidebar ─────────────────────────── */
function ManageNetwork({ connections }) {
  const items = [
    { icon: <Users size={16}/>,     label: 'Connections',   val: connections.length },
    { icon: <Link2 size={16}/>,     label: 'Contacts',      val: 0 },
    { icon: <Layers size={16}/>,    label: 'Groups',        val: 12 },
    { icon: <BookOpen size={16}/>,  label: 'Pages',         val: 4 },
    { icon: <Calendar size={16}/>,  label: 'Events',        val: 84 },
  ];

  return (
    <aside className="mn-sidebar">
      <div className="mn-card">
        <div className="mn-title">Manage my network</div>
        <ul className="mn-list">
          {items.map(it => (
            <li key={it.label} className="mn-item">
              <span className="mn-icon">{it.icon}</span>
              <span className="mn-label">{it.label}</span>
              <span className="mn-val">{it.val.toLocaleString()}</span>
              <ChevronRight size={14} className="mn-chevron"/>
            </li>
          ))}
        </ul>
      </div>

      {/* Grow network promo */}
      <div className="mn-promo">
        <div className="mn-promo-text">
          <strong>Grow your network</strong>
          <p>Find and follow the right people by expanding your connections.</p>
        </div>
      </div>

      {/* Pending invitations */}
      <div className="mn-pending">
        <span className="mn-pending-label">No pending invitations</span>
        <button className="mn-manage-btn">Manage</button>
      </div>
    </aside>
  );
}

/* ── Person card (LinkedIn style) ──────────────────────── */
function PersonCard({ person, index, onConnect, connected }) {
  const banner = BANNERS[index % BANNERS.length];
  return (
    <div className="li-person-card">
      {/* Banner */}
      <div className="lipc-banner" style={{ background: banner }}/>

      {/* Avatar */}
      <div className="lipc-avatar-wrap">
        <div className="lipc-avatar" style={{ background: person.avatarColor }}>
          {person.initials}
        </div>
      </div>

      {/* Body */}
      <div className="lipc-body">
        <div className="lipc-name">{person.name}</div>
        <div className="lipc-headline">{person.headline}</div>
        <div className="lipc-mutual">
          <Users size={11}/> {person.mutualConnections} mutual connections
        </div>
      </div>

      {/* Action */}
      <div className="lipc-footer">
        {connected ? (
          <button className="lipc-btn lipc-btn--connected" disabled>
            <UserCheck size={14}/> Connected
          </button>
        ) : (
          <button className="lipc-btn" onClick={() => onConnect(person.id)}>
            <UserPlus size={14}/> Connect
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Connection row (My Connections tab) ──────────────── */
function ConnectionRow({ person }) {
  return (
    <div className="li-conn-row">
      <div className="li-conn-avatar" style={{ background: person.avatarColor }}>
        {person.initials}
      </div>
      <div className="li-conn-info">
        <div className="li-conn-name">{person.name}</div>
        <div className="li-conn-headline">{person.headline}</div>
        <div className="li-conn-location">{person.location}</div>
      </div>
      <button className="li-conn-btn">
        <UserCheck size={14}/> Connected
      </button>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────── */
export default function Network() {
  const { connections, suggestions, connect, user } = useApp();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [connected, setConnected] = useState(new Set());

  const handleConnect = (id) => {
    connect(id);
    setConnected(prev => new Set([...prev, id]));
  };

  return (
    <div className="page-container">
      <div className="network-layout">

        {/* LEFT: Manage my network sidebar */}
        <ManageNetwork connections={connections} />

        {/* RIGHT: Main content */}
        <main className="network-main">

          {/* Tabs — LinkedIn style */}
          <div className="li-tabs-bar">
            <button
              className={`li-tab-btn ${activeTab === 'suggestions' ? 'li-tab-active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              People you may know
            </button>
            <button
              className={`li-tab-btn ${activeTab === 'connections' ? 'li-tab-active' : ''}`}
              onClick={() => setActiveTab('connections')}
            >
              My Connections ({connections.length})
            </button>
          </div>

          {/* SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <>
              <div className="li-section-sub">
                in your agricultural network
              </div>
              <div className="lipc-grid">
                {suggestions.map((s, i) => (
                  <PersonCard
                    key={s.id}
                    person={s}
                    index={i}
                    onConnect={handleConnect}
                    connected={connected.has(s.id)}
                  />
                ))}
              </div>
              {suggestions.length > 0 && (
                <button className="li-see-all">
                  See all people you may know
                </button>
              )}
            </>
          )}

          {/* CONNECTIONS */}
          {activeTab === 'connections' && (
            <div className="li-connections-list">
              {connections.length === 0 ? (
                <div className="li-empty">
                  <Users size={48} strokeWidth={1.2}/>
                  <p>No connections yet — start connecting!</p>
                </div>
              ) : (
                connections.map(c => (
                  <ConnectionRow key={c.id} person={c} />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
