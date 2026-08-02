import { useState } from 'react';
import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SendPostModal from './SendPostModal';
import './PostCard.css';

export default function PostCard({ post }) {
  const { likePost, addComment, repostPost, user } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);

  const isLong = post.content.length > 280;
  const displayText = !expanded && isLong ? post.content.slice(0, 280) + '…' : post.content;

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleShare = () => {
    setShowShareMenu(v => !v);
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard?.writeText(postUrl);
    alert('✅ Link copied to clipboard!');
    setShowShareMenu(false);
  };

  const handleShareVia = (platform) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const text = `Check out this post by ${post.authorName}: ${post.content.slice(0, 100)}...`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const formatNum = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n;

  return (
    <article className="post-card card animate-fadeIn">
      {/* Author */}
      <div className="post-author">
        <div className="avatar avatar-md" style={{ background: post.authorColor }}>{post.authorInitials}</div>
        <div className="post-author-info">
          <div className="post-author-name">{post.authorName}</div>
          <div className="text-sm text-secondary">{post.authorHeadline}</div>
          <div className="text-xs text-muted">{post.time} · 🌐</div>
        </div>
        <button className="btn btn-icon btn-ghost post-more"><MoreHorizontal size={18} /></button>
      </div>

      {/* Content */}
      <div className="post-content">
        <p className="post-text" style={{ whiteSpace: 'pre-line' }}>{displayText}</p>
        {isLong && (
          <button className="show-more-btn" onClick={() => setExpanded(v => !v)}>
            {expanded ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> See more</>}
          </button>
        )}
        {post.image && (
          <div className="post-media" style={{ marginTop: 10 }}>
            <img src={post.image} alt="Post attachment" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Stats */}
      {(post.likes > 0 || post.comments > 0 || post.reposts > 0) && (
        <div className="post-stats">
          {post.likes > 0 && <span className="post-stat-item"><span className="like-emoji">👍</span> {formatNum(post.likes)}</span>}
          {post.comments > 0 && (
            <button className="post-stat-item post-stat-btn" onClick={() => setShowComments(v=>!v)}>
              {formatNum(post.comments)} comments
            </button>
          )}
          {post.reposts > 0 && <span className="post-stat-item">{formatNum(post.reposts)} reposts</span>}
        </div>
      )}

      <hr className="divider" />

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${post.liked ? 'liked' : ''}`}
          onClick={() => likePost(post.id)}
        >
          <ThumbsUp size={18} />
          <span>Like</span>
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(v=>!v)}>
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button
          className={`post-action-btn ${post.reposted ? 'liked' : ''}`}
          onClick={() => repostPost(post.id)}
        >
          <Repeat2 size={18} />
          <span>{post.reposted ? 'Reposted' : 'Repost'}</span>
        </button>
        <div style={{ position: 'relative' }}>
          <button className="post-action-btn" onClick={handleShare}>
            <Share2 size={18} />
            <span>Share</span>
          </button>
          {showShareMenu && (
            <div className="share-menu">
              <button className="share-menu-item" onClick={handleCopyLink}>
                📋 Copy link
              </button>
              <button className="share-menu-item" onClick={() => setShowSendModal(true)}>
                <Send size={14} /> Send in a message
              </button>
              <div className="share-menu-divider" />
              <button className="share-menu-item" onClick={() => handleShareVia('linkedin')}>
                💼 Share on LinkedIn
              </button>
              <button className="share-menu-item" onClick={() => handleShareVia('twitter')}>
                🐦 Share on Twitter
              </button>
              <button className="share-menu-item" onClick={() => handleShareVia('facebook')}>
                👍 Share on Facebook
              </button>
              <button className="share-menu-item" onClick={() => handleShareVia('whatsapp')}>
                💬 Share on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          {post.commentList.map(c => (
            <div key={c.id} className="comment">
              <div className="avatar avatar-sm" style={{ background: c.color }}>{c.initials}</div>
              <div className="comment-bubble">
                <div className="comment-author">{c.authorName} <span className="text-muted text-xs">{c.time}</span></div>
                <div className="comment-text">{c.text}</div>
              </div>
            </div>
          ))}

          <form className="comment-form" onSubmit={handleComment}>
            <div className="avatar avatar-sm" style={{ background: user.avatarColor }}>{user.initials}</div>
            <input
              className="input comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Send Post Modal */}
      {showSendModal && (
        <SendPostModal post={post} onClose={() => setShowSendModal(false)} />
      )}
    </article>
  );
}
