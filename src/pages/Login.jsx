import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Auth.css';

export default function Login() {
  const { login, signInWithEmail } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-container animate-slideUp">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌾</div>
          <div className="logo-text-wrap">
            <span className="auth-logo-text">FarmWorld</span>
            <span className="auth-tagline">Where Farmers Connect</span>
          </div>
        </div>

        <div className="auth-card card">
          <div className="auth-header">
            <h1>Welcome back, Farmer</h1>
            <p>Sign in to connect with farmers worldwide and grow your agricultural network</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  className="input input-with-icon"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  className="input input-with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(v=>!v)}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <><Sparkles size={16}/> Sign In to FarmWorld</>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn btn-ghost w-full" onClick={() => { login('demo@linkinide.com'); navigate('/'); }}>
            Continue as Guest Demo
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Join now</Link>
        </div>
      </div>
    </div>
  );
}
