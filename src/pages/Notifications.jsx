import { useApp } from '../context/AppContext';
import { ThumbsUp, MessageCircle, Repeat2, UserPlus, Briefcase, AtSign, Bell, Check } from 'lucide-react';
import './Notifications.css';

const ICON_MAP = {
  like: ThumbsUp,
  comment: MessageCircle,
  repost: Repeat2,
  connection: UserPlus,
  job: Briefcase,
  mention: AtSign,
};

const COLOR_MAP = {
  like: '#0077B5',
  comment: '#10b981',
  repost: '#7C3AED',
  connection: '#f59e0b',
  job: '#ec4899',
  mention: '#00C4FF',
};

export default function Notifications() {
  const { notifications, markNotificationsRead } = useApp();
  const unread = notifications.filter(n => !n.read);

  return (
    <div className="page-container">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>{unread.length > 0 ? `${unread.length} new notifications` : 'All caught up!'}</p>
        </div>
        {unread.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markNotificationsRead}>
            <Check size={15}/> Mark all as read
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.map(n => {
          const Icon = ICON_MAP[n.type] || Bell;
          const color = COLOR_MAP[n.type] || '#0077B5';
          return (
            <div key={n.id} className={`card notif-item ${!n.read ? 'unread' : ''}`}>
              <div className="notif-actor-wrap">
                <div className="avatar avatar-md" style={{ background: n.actorColor }}>{n.actorInitials}</div>
                <div className="notif-type-icon" style={{ background: color }}>
                  <Icon size={11} color="#fff" />
                </div>
              </div>
              <div className="notif-body">
                <div className="notif-text">
                  <span className="notif-actor">{n.actor}</span>{' '}
                  <span className="text-secondary">{n.content}</span>
                </div>
                <div className="notif-time">{n.time}</div>
              </div>
              {!n.read && <div className="notif-unread-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
