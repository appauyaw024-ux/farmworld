import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Briefcase, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Auth.css';

export default function Signup() {
  const { signUpWithEmail } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', headline: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const { user } = await signUpWithEmail(form.email, form.password, form.name, form.headline);
      if (user) {
        navigate('/');
      } else {
        // Email confirmation required
        setSuccess('✅ Account created! Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
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
        <div className="auth-logo">
          <div className="auth-logo-icon">🌾</div>
          <div className="logo-text-wrap">
            <span className="auth-logo-text">FarmWorld</span>
            <span className="auth-tagline">Where Farmers Connect</span>
          </div>
        </div>

        <div className="auth-card card">
          <div className="auth-header">
            <h1>Join FarmWorld</h1>
            <p>Connect with farmers, traders and agri-businesses from every corner of the world</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input id="signup-name" className="input input-with-icon" type="text" placeholder="Alex Morgan" value={form.name} onChange={update('name')} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Email *</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input id="signup-email" className="input input-with-icon" type="email" placeholder="your@email.com" value={form.email} onChange={update('email')} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Professional Headline</label>
              <div className="input-icon-wrap">
                <Briefcase size={16} className="input-icon" />
                <input id="signup-headline" className="input input-with-icon" type="text" placeholder="Senior Engineer @ Company" value={form.headline} onChange={update('headline')} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Password *</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="signup-password"
                  className="input input-with-icon"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={update('password')}
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(v=>!v)}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button id="signup-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <><Sparkles size={16}/> Create Account</>}
            </button>
          </form>

          <div className="auth-terms">
            By joining, you agree to FarmWorld's <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
