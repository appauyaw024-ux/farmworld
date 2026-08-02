import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, X, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './SendPostModal.css';

export default function SendPostModal({ post, onClose }) {
  const { connections, groups, sendPostInDM, setActiveConv } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [noteText, setNoteText] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [sentMap, setSentMap] = useState({});

  // Merge connections and conversations for recipient options
  const allRecipients = [
    // Direct connections
    ...connections.map(c => ({
      id: c.id,
      name: c.name,
      subtitle: c.headline || 'Connection',
      initials: c.initials,
      color: c.avatarColor || c.color || '#15803d',
      isGroup: false,
    })),
    // Group conversations
    ...groups.map(g => ({
      id: g.id,
      name: g.name,
      subtitle: `${g.members?.length || 0} members`,
      initials: g.emoji || '💬',
      color: '#15803d',
      isGroup: true,
    })),
  ];

  const filteredRecipients = allRecipients.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendTo = async (recipient) => {
    setSendingId(recipient.id);
    try {
      const updatedConv = await sendPostInDM(recipient.id, post, noteText);
      setSentMap(prev => ({ ...prev, [recipient.id]: updatedConv }));
    } catch (err) {
      console.error('Failed to send post:', err);
    } finally {
      setSendingId(null);
    }
  };

  const handleGoToChat = (targetConv) => {
    if (targetConv) {
      setActiveConv(targetConv);
    }
    onClose();
    navigate('/messaging');
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal send-post-modal animate-slideUp">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Send size={18} color="var(--primary-light)" />
            <h3 style={{ margin: 0 }}>Send Post in Message</h3>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Post Preview Card */}
          <div className="send-post-preview">
            <div className="flex items-center gap-2 mb-2">
              <div className="avatar avatar-xs" style={{ background: post.authorColor }}>
                {post.authorInitials}
              </div>
              <span className="font-600 text-sm">{post.authorName}</span>
              <span className="text-xs text-muted">· {post.time}</span>
            </div>
            <p className="send-post-preview-text">
              {post.content.length > 120 ? `${post.content.slice(0, 120)}…` : post.content}
            </p>
          </div>

          {/* Optional message input */}
          <div className="input-group mb-3">
            <label className="input-label text-xs">Add a message (optional)</label>
            <input
              className="input text-sm"
              placeholder="Write a message to accompany this post..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
          </div>

          {/* Search Contacts */}
          <div className="input-group mb-2" style={{ position: 'relative' }}>
            <Search size={14} className="send-post-search-icon" />
            <input
              className="input input-with-icon text-sm"
              placeholder="Search contacts or groups..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Recipients List */}
          <div className="send-post-recipients-list">
            {filteredRecipients.length === 0 ? (
              <div className="text-center py-4 text-secondary text-sm">
                No connections or groups found
              </div>
            ) : (
              filteredRecipients.map(r => {
                const isSent = !!sentMap[r.id];
                const isSending = sendingId === r.id;

                return (
                  <div key={r.id} className="send-post-recipient-item">
                    <div className="avatar avatar-md" style={{ background: r.color }}>
                      {r.initials}
                    </div>
                    <div className="send-post-recipient-info">
                      <div className="font-600 text-sm flex items-center gap-1">
                        {r.name}
                        {r.isGroup && <span className="badge text-xs">Group</span>}
                      </div>
                      <div className="text-xs text-muted">{r.subtitle}</div>
                    </div>

                    {isSent ? (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-success text-xs flex items-center gap-1">
                          <Check size={12} /> Sent
                        </span>
                        <button
                          className="btn btn-ghost btn-xs flex items-center gap-1"
                          onClick={() => handleGoToChat(sentMap[r.id])}
                        >
                          View Chat <ExternalLink size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm flex items-center gap-1"
                        disabled={isSending}
                        onClick={() => handleSendTo(r)}
                      >
                        {isSending ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send size={13} /> Send
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
