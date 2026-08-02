import { useState, useRef } from 'react';
import { Image, Link2, FileText, Smile, X, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './CreatePost.css';

const EMOJI_LIST = ['🌾', '🚜', '🐷', '🌽', '🐔', '🐄', '🌱', '🍎', '💡', '🔥', '👍', '😊', '🤝', '🏆', '❤️', '✨', '⭐', '🎉', '📢', '💼'];

export default function CreatePost() {
  const { user, createPost } = useApp();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const fileInputRef = useRef(null);

  const handleSubmit = () => {
    if (!text.trim() && !imageUrl) return;
    createPost(text, imageUrl || null);
    setText('');
    setImageUrl('');
    setShowImageInput(false);
    setShowEmojiPicker(false);
    setShowLinkInput(false);
    setOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setShowImageInput(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const formattedLink = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    setText(prev => `${prev} ${formattedLink}`.trim());
    setLinkUrl('');
    setShowLinkInput(false);
  };

  return (
    <>
      {/* Trigger row */}
      <div className="create-post-trigger card">
        <div className="avatar avatar-md" style={{ background: user.avatarColor }}>{user.initials}</div>
        <button className="create-post-input-btn" onClick={() => setOpen(true)}>
          Start a post, try writing with AI…
        </button>
      </div>

      {/* Quick actions */}
      <div className="create-post-actions">
        <button className="create-quick-btn" onClick={() => { setOpen(true); setShowImageInput(true); }}>
          <Image size={18} color="#70b5f9" /> <span>Media</span>
        </button>
        <button className="create-quick-btn" onClick={() => setOpen(true)}>
          <FileText size={18} color="#e7a33e" /> <span>Article</span>
        </button>
        <button className="create-quick-btn" onClick={() => { setOpen(true); setShowLinkInput(true); }}>
          <Link2 size={18} color="#df704d" /> <span>Link</span>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal create-post-modal animate-slideUp">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md" style={{ background: user.avatarColor }}>{user.initials}</div>
                <div>
                  <div className="font-600">{user.name}</div>
                  <div className="text-sm text-secondary">Post to Anyone 🌐</div>
                </div>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setOpen(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <textarea
                className="input create-post-textarea"
                placeholder="What do you want to talk about?"
                value={text}
                onChange={e => setText(e.target.value)}
                autoFocus
                rows={6}
              />

              {/* Image Preview if attached */}
              {imageUrl && (
                <div className="create-post-image-preview">
                  <img src={imageUrl} alt="Attached media" />
                  <button className="btn btn-icon btn-danger remove-img-btn" onClick={() => setImageUrl('')}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Image Attachment Bar */}
              {showImageInput && (
                <div className="create-post-attach-box">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Image File
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <span className="text-xs text-muted">or paste image URL:</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="input text-sm"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => setShowImageInput(false)}>Done</button>
                  </div>
                </div>
              )}

              {/* Link Input Bar */}
              {showLinkInput && (
                <div className="create-post-attach-box">
                  <label className="text-xs font-600 text-secondary mb-1 block">Add Web Link</label>
                  <div className="flex gap-2">
                    <input
                      className="input text-sm"
                      placeholder="e.g. www.farmworld.com/market"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleAddLink}>Add</button>
                  </div>
                </div>
              )}

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="create-post-emoji-picker">
                  {EMOJI_LIST.map(e => (
                    <button key={e} className="emoji-picker-btn" onClick={() => addEmoji(e)}>
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div className="create-post-toolbar">
                <div className="flex gap-2">
                  <button
                    className={`btn btn-icon btn-ghost ${showImageInput || imageUrl ? 'active-tool' : ''}`}
                    title="Add Media / Image"
                    onClick={() => { setShowImageInput(v => !v); setShowEmojiPicker(false); setShowLinkInput(false); }}
                  >
                    <Image size={18} color="#70b5f9" />
                  </button>
                  <button
                    className={`btn btn-icon btn-ghost ${showEmojiPicker ? 'active-tool' : ''}`}
                    title="Add Emoji"
                    onClick={() => { setShowEmojiPicker(v => !v); setShowImageInput(false); setShowLinkInput(false); }}
                  >
                    <Smile size={18} color="#e7a33e" />
                  </button>
                  <button
                    className={`btn btn-icon btn-ghost ${showLinkInput ? 'active-tool' : ''}`}
                    title="Add Link"
                    onClick={() => { setShowLinkInput(v => !v); setShowImageInput(false); setShowEmojiPicker(false); }}
                  >
                    <Link2 size={18} color="#df704d" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">{text.length > 0 ? `${text.length} chars` : ''}</span>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!text.trim() && !imageUrl}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
