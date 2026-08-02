import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Users, Briefcase, MessageSquare, Bell,
  Search, ChevronDown, LogOut, Settings, User,
  Menu, X, Wheat, ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, unreadNotifCount, unreadMsgCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/',             icon: Home,          label: 'Home' },
    { path: '/network',      icon: Users,         label: 'Network' },
    { path: '/jobs',         icon: Briefcase,     label: 'Jobs' },
    { path: '/trade',        icon: Wheat,         label: 'Trade' },
    { path: '/shops',        icon: ShoppingBag,   label: 'Shops' },
    { path: '/messaging',    icon: MessageSquare, label: 'Messaging', badge: unreadMsgCount },
    { path: '/notifications',icon: Bell,          label: 'Notifications', badge: unreadNotifCount },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="FarmWorld" className="logo-icon-img" />
          <div className="logo-text-wrap">
            <span className="logo-text">FarmWorld</span>
            <span className="logo-tagline">Where Farmers Connect</span>
          </div>
        </Link>

        {/* Search */}
        <div className="navbar-search">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search farmers, crops, markets, traders…"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>

        {/* Nav Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <div className="nav-icon-wrap">
                <Icon size={22} />
                {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
              </div>
              <span className="nav-label">{label}</span>
            </Link>
          ))}

          {/* Profile dropdown */}
          <div className="nav-profile" ref={profileRef}>
            <button className="nav-profile-btn" onClick={() => setProfileOpen(o => !o)}>
              <div className="avatar avatar-sm" style={{ background: user.avatarColor }}>{user.initials}</div>
              <span className="nav-label">Me</span>
              <ChevronDown size={14} className={`chevron ${profileOpen ? 'open' : ''}`} />
            </button>
            {profileOpen && (
              <div className="profile-dropdown animate-slideUp">
                <div className="dropdown-header">
                  <div className="avatar avatar-md" style={{ background: user.avatarColor }}>{user.initials}</div>
                  <div className="dropdown-header-info">
                    <div className="font-600">{user.name}</div>
                    <div className="text-sm text-secondary dropdown-headline">{user.headline}</div>
                  </div>
                </div>
                <Link to="/profile/me" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <User size={16} /> View Profile
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={16} /> Settings
                </Link>
                <hr className="divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
