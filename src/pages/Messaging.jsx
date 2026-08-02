import { useState, useRef, useEffect } from 'react';
import {
  Send, Search, Phone, Video, MoreHorizontal, Circle,
  Users, Plus, ChevronRight, X, Check, UserPlus,
  LogOut, Edit3, Info, MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Messaging.css';

/* ── Emoji Picker (simple) ─────────────────────────────────── */
const EMOJIS = ['💬','🚀','🤖','💡','🎯','🔥','⚡','🌟','🎉','🏆','💼','🧠','🌐','🛠️','📊','🤝'];

/* ── Group Avatar ──────────────────────────────────────────── */
function GroupAvatar({ members, size = 44 }) {
  const top2 = members.slice(0, 2);
  const s2 = Math.round(size * 0.6);
  return (
    <div className="group-avatar-stack" style={{ width: size, height: size }}>
      {top2.map((m, i) => (
        <div
          key={m.id}
          className="group-avatar-member"
          style={{
            width: s2, height: s2, fontSize: s2 * 0.38,
            background: m.color,
            top: i === 0 ? 0 : 'auto',
            bottom: i === 1 ? 0 : 'auto',
            left: i === 0 ? 0 : 'auto',
            right: i === 1 ? 0 : 'auto',
          }}
        >
          {m.initials}
        </div>
      ))}
    </div>
  );
}

/* ── Create / Edit Group Modal ─────────────────────────────── */
function GroupModal({ onClose, onSave, connections, currentUser, existing }) {
  const [name, setName] = useState(existing?.name || '');
  const [emoji, setEmoji] = useState(existing?.emoji || '💬');
  const [desc, setDesc] = useState(existing?.description || '');
  const [selectedIds, setSelectedIds] = useState(
    existing?.members?.filter(m => m.id !== currentUser.id).map(m => m.id) || []
  );
  const [showEmoji, setShowEmoji] = useState(false);
  const [search, setSearch] = useState('');

  const toggleMember = (id) =>
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const filtered = connections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const isEdit = !!existing;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal group-modal animate-slideUp">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Group' : 'Create a Group'}</h3>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Emoji + Name */}
          <div className="group-name-row">
            <div style={{ position: 'relative' }}>
              <button className="group-emoji-btn" onClick={() => setShowEmoji(v => !v)}>{emoji}</button>
              {showEmoji && (
                <div className="emoji-picker">
                  {EMOJIS.map(e => (
                    <button key={e} className="emoji-opt" onClick={() => { setEmoji(e); setShowEmoji(false); }}>{e}</button>
                  ))}
                </div>
              )}
            </div>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Group name *"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Description */}
          <textarea
            className="input"
            placeholder="Group description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />

          {/* Member picker */}
          {!isEdit && (
            <>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>
                Add members from your connections
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search connections..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="member-pick-list">
                {filtered.length === 0 && <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '12px 0' }}>No connections found</p>}
                {filtered.map(c => (
                  <div key={c.id} className="member-pick-item" onClick={() => toggleMember(c.id)}>
                    <div className="avatar avatar-sm" style={{ background: c.avatarColor || c.color }}>{c.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      <div className="text-xs text-secondary">{c.headline}</div>
                    </div>
                    <div className={`member-check ${selectedIds.includes(c.id) ? 'selected' : ''}`}>
                      {selectedIds.includes(c.id) && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>
              {selectedIds.length > 0 && (
                <div className="text-sm text-secondary">
                  {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim(), emoji, description: desc.trim(), memberIds: selectedIds })}
          >
            {isEdit ? 'Save Changes' : <><Plus size={15}/> Create Group</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Group Info Panel ──────────────────────────────────────── */
function GroupInfoPanel({ group, currentUser, onAddMember, onLeave, onEdit, connections, onClose }) {
  const [addSearch, setAddSearch] = useState('');
  const canAdd = connections.filter(c =>
    !group.members.find(m => m.id === c.id) &&
    c.name.toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <div className="group-info-panel animate-slideUp">
      <div className="group-info-header">
        <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        <span className="font-600">Group Info</span>
        <button className="btn btn-icon btn-ghost" onClick={onEdit}><Edit3 size={16}/></button>
      </div>

      {/* Icon + name */}
      <div className="group-info-hero">
        <div className="group-info-emoji">{group.emoji}</div>
        <div className="group-info-name">{group.name}</div>
        {group.description && <div className="text-sm text-secondary" style={{ textAlign: 'center', marginTop: 4 }}>{group.description}</div>}
        <div className="text-xs text-muted" style={{ marginTop: 8 }}>{group.members.length} members</div>
      </div>

      {/* Members list */}
      <div className="group-info-section">
        <div className="group-info-section-title">Members</div>
        {group.members.map(m => (
          <div key={m.id} className="group-info-member">
            <div className="avatar avatar-sm" style={{ background: m.color }}>{m.initials}</div>
            <div style={{ flex: 1 }}>
              <div className="text-sm font-600">{m.name}</div>
              {m.id === group.createdBy && <div className="text-xs text-muted">Admin</div>}
            </div>
            {m.id === currentUser.id && <span className="text-xs text-muted">You</span>}
          </div>
        ))}
      </div>

      {/* Add member */}
      <div className="group-info-section">
        <div className="group-info-section-title">Add members</div>
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search..." value={addSearch} onChange={e => setAddSearch(e.target.value)} />
        </div>
        {canAdd.slice(0, 4).map(c => (
          <div key={c.id} className="group-info-member" style={{ cursor: 'pointer' }} onClick={() => onAddMember(group.id, c.id)}>
            <div className="avatar avatar-sm" style={{ background: c.avatarColor || c.color }}>{c.initials}</div>
            <div style={{ flex: 1 }}><div className="text-sm font-600">{c.name}</div></div>
            <UserPlus size={14} color="var(--primary-light)" />
          </div>
        ))}
        {canAdd.length === 0 && <p className="text-xs text-muted">No more connections to add</p>}
      </div>

      {/* Leave */}
      <div className="group-info-section">
        <button className="btn btn-danger w-full btn-sm" onClick={() => onLeave(group.id)}>
          <LogOut size={14}/> Leave group
        </button>
      </div>
    </div>
  );
}

/* ── Main Messaging Page ────────────────────────────────────── */
export default function Messaging() {
  const { conversations, groups, activeConv, setActiveConv, sendMessage,
          createGroup, updateGroup, addMemberToGroup, leaveGroup,
          user, connections, markConversationRead } = useApp();

  const [msgText, setMsgText] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'dms' | 'groups'
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // All convos merged and filtered
  const allConvs = [
    ...conversations.map(c => ({ ...c, isGroup: false })),
    ...groups,
  ].filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const tabFiltered = activeTab === 'dms' ? allConvs.filter(c => !c.isGroup)
    : activeTab === 'groups' ? allConvs.filter(c => c.isGroup)
    : allConvs;

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeConv) return;
    sendMessage(activeConv.id, msgText);
    setMsgText('');
  };

  const handleCreateGroup = (data) => {
    createGroup(data);
    setShowCreateGroup(false);
  };

  const handleEditGroup = (data) => {
    updateGroup(activeConv.id, data);
    setShowEditGroup(false);
  };

  const handleLeave = (groupId) => {
    leaveGroup(groupId);
    setShowGroupInfo(false);
    setActiveConv(conversations[0] || null);
  };

  const isGroupConv = activeConv?.isGroup;

  return (
    <div className="messaging-page page-container">
      <div className={`messaging-layout card ${showGroupInfo && isGroupConv ? 'with-info' : ''}`}>

        {/* ── Sidebar ── */}
        <div className="messaging-sidebar">
          <div className="messaging-sidebar-header">
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Messaging</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateGroup(true)}
                title="Create new group"
              >
                <Users size={14}/> New Group
              </button>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                className="input messaging-search"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Tabs */}
            <div className="msg-tabs">
              {['all', 'dms', 'groups'].map(t => (
                <button
                  key={t}
                  className={`msg-tab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'all' ? 'All' : t === 'dms' ? <><MessageSquare size={13}/> DMs</> : <><Users size={13}/> Groups</>}
                </button>
              ))}
            </div>
          </div>

          <div className="conv-list">
            {tabFiltered.length === 0 && (
              <div className="empty-state" style={{ padding: 24 }}>
                <p className="text-sm text-muted">No conversations found</p>
              </div>
            )}
            {tabFiltered.map(conv => (
              <button
                key={conv.id}
                className={`conv-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                onClick={() => { setActiveConv(conv); markConversationRead(conv.id); setShowGroupInfo(false); }}
              >
                {/* Avatar */}
                {conv.isGroup ? (
                  <div className="conv-avatar-wrap" style={{ flexShrink: 0 }}>
                    <div className="group-icon-pill">{conv.emoji}</div>
                  </div>
                ) : (
                  <div className="conv-avatar-wrap">
                    <div className="avatar avatar-md" style={{ background: conv.color }}>{conv.initials}</div>
                    <span className="online-dot" />
                  </div>
                )}

                <div className="conv-info">
                  <div className="conv-name-row">
                    <span className={`conv-name ${conv.unread > 0 ? 'unread' : ''}`}>
                      {conv.name}
                    </span>
                    <span className="conv-time">{conv.time}</span>
                  </div>
                  <div className="conv-last-msg">
                    {conv.isGroup && <Users size={10} style={{ display: 'inline', marginRight: 4 }} />}
                    {conv.lastMessage}
                  </div>
                </div>

                {conv.unread > 0 && <span className="badge badge-count">{conv.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat window ── */}
        {activeConv ? (
          <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
              <div className="flex items-center" style={{ gap: 12 }}>
                {isGroupConv ? (
                  <div className="group-icon-pill large">{activeConv.emoji}</div>
                ) : (
                  <div className="conv-avatar-wrap">
                    <div className="avatar avatar-md" style={{ background: activeConv.color }}>{activeConv.initials}</div>
                    <span className="online-dot" />
                  </div>
                )}
                <div>
                  <div className="font-600">{activeConv.name}</div>
                  {isGroupConv ? (
                    <div className="text-xs text-muted">
                      {activeConv.members.length} members · {activeConv.members.map(m => m.name.split(' ')[0]).join(', ')}
                    </div>
                  ) : (
                    <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Circle size={8} fill="#10b981" color="#10b981" /> Active now
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-header-actions">
                {!isGroupConv && <>
                  <button 
                    className="btn btn-icon btn-ghost" 
                    onClick={() => alert(`📞 Initiating audio call with ${activeConv.name}...\n\nThis feature will connect you via voice call.`)}
                    title="Voice call"
                  >
                    <Phone size={18}/>
                  </button>
                  <button 
                    className="btn btn-icon btn-ghost"
                    onClick={() => alert(`🎥 Initiating video call with ${activeConv.name}...\n\nThis feature will start a video call.`)}
                    title="Video call"
                  >
                    <Video size={18}/>
                  </button>
                </>}
                {isGroupConv && (
                  <button
                    className="btn btn-icon btn-ghost"
                    title="Group info"
                    onClick={() => setShowGroupInfo(v => !v)}
                  >
                    <Info size={18}/>
                  </button>
                )}
                <button 
                  className="btn btn-icon btn-ghost"
                  onClick={() => alert('More options:\n• Mute conversation\n• Block user\n• Archive chat\n• Delete conversation')}
                  title="More options"
                >
                  <MoreHorizontal size={18}/>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              <div className="messages-date">Today</div>
              {activeConv.messages.map((msg, index) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="system-message">{msg.text}</div>
                  );
                }
                const isMe = msg.senderId === user.id;
                const unreadCount = activeConv.unread || 0;
                const showUnreadDivider = unreadCount > 0 && index === activeConv.messages.length - unreadCount;

                return (
                  <div key={msg.id}>
                    {showUnreadDivider && (
                      <div className="unread-messages-divider">
                        <span>NEW UNREAD MESSAGES ({unreadCount})</span>
                      </div>
                    )}
                    <div className={`message-row ${isMe ? 'me' : 'them'} ${unreadCount > 0 && index >= activeConv.messages.length - unreadCount ? 'unread-highlight' : ''}`}>
                      {!isMe && (
                        <div
                          className="avatar avatar-sm"
                          style={{ background: msg.senderColor || activeConv.color }}
                          title={msg.senderName}
                        >
                          {msg.senderInitials || activeConv.initials}
                        </div>
                      )}
                      <div className="message-wrap">
                        {isGroupConv && !isMe && (
                          <div className="message-sender-name">{msg.senderName}</div>
                        )}
                        <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                          {msg.text}
                        </div>
                        <div className="message-time">{msg.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                className="input chat-input"
                placeholder={isGroupConv ? `Message ${activeConv.name}…` : `Message ${activeConv.name}…`}
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!msgText.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-empty">
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={48} color="var(--text-muted)" />
              <p className="text-secondary" style={{ marginTop: 12 }}>Select a conversation or create a group</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowCreateGroup(true)}>
                <Users size={14}/> Create a Group
              </button>
            </div>
          </div>
        )}

        {/* ── Group Info Panel ── */}
        {showGroupInfo && isGroupConv && (
          <GroupInfoPanel
            group={activeConv}
            currentUser={user}
            connections={connections}
            onAddMember={addMemberToGroup}
            onLeave={handleLeave}
            onEdit={() => { setShowEditGroup(true); setShowGroupInfo(false); }}
            onClose={() => setShowGroupInfo(false)}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showCreateGroup && (
        <GroupModal
          onClose={() => setShowCreateGroup(false)}
          onSave={handleCreateGroup}
          connections={connections}
          currentUser={user}
        />
      )}
      {showEditGroup && activeConv?.isGroup && (
        <GroupModal
          existing={activeConv}
          onClose={() => setShowEditGroup(false)}
          onSave={handleEditGroup}
          connections={connections}
          currentUser={user}
        />
      )}
    </div>
  );
}
