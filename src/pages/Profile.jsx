import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Link2, Users, Edit3, Award, Briefcase, GraduationCap, Plus, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import './Profile.css';

export default function Profile() {
  const { user, posts } = useApp();
  const myPosts = posts.filter(p => p.authorId === user.id);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
        alert('✅ Profile photo updated!\n\nNote: This is a preview. In production, this would upload to your server.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page-container profile-page">
      {/* Banner + Avatar */}
      <div className="card profile-banner-card">
        <div className="profile-banner" style={{ background: user.banner }} />
        <div className="profile-header-content">
          <div className="profile-avatar-wrap">
            <div 
              className="avatar avatar-xl profile-avatar" 
              style={{ 
                background: avatarUrl ? 'transparent' : user.avatarColor,
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={handleAvatarClick}
              title="Click to change profile photo"
            >
              {!avatarUrl && user.initials}
              <div className="avatar-edit-overlay">
                <Camera size={24} />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div className="profile-info">
            <div className="profile-top-row">
              <div>
                <h1 className="profile-name">{user.name}</h1>
                <p className="profile-headline">{user.headline}</p>
                <div className="profile-meta">
                  <span><MapPin size={14}/> {user.location}</span>
                  <span>·</span>
                  <span className="profile-connections"><Users size={14}/> {user.connections.toLocaleString()} connections</span>
                </div>
              </div>
              <button 
                className="btn btn-ghost"
                onClick={() => alert('✏️ Edit Profile\n\nYou can edit:\n• Profile photo & banner\n• Name & headline\n• Location\n• Industry\n• Contact information\n• About section\n\nChanges will be saved automatically.')}
              >
                <Edit3 size={16}/> Edit profile
              </button>
            </div>
            <div className="profile-actions">
              <button 
                className="btn btn-primary"
                onClick={() => alert('💼 Open to Work Settings\n\nSet your preferences:\n• Open to new opportunities\n• Job types you\'re interested in\n• Locations you prefer\n• Salary expectations\n\nRecruiters will see you\'re open to opportunities!')}
              >
                Open to
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => alert('➕ Add Profile Section\n\nChoose what to add:\n• Featured\n• Projects\n• Certifications\n• Publications\n• Honors & Awards\n• Languages\n• Volunteer Experience\n• Courses\n• Test Scores')}
              >
                Add section
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => alert('⚙️ More Options\n\n• Share profile\n• Save as PDF\n• QR code\n• Profile settings\n• Privacy settings\n• Account preferences\n• View profile as others see it')}
              >
                More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Col */}
        <div className="profile-left">
          {/* About */}
          <div className="card profile-section">
            <div className="section-header">
              <h2 className="section-title">About</h2>
              <button 
                className="btn btn-icon btn-ghost"
                onClick={() => alert('✏️ Edit About Section\n\nShare your story, skills, and what makes you unique.\n\nTip: A well-written About section helps you stand out!')}
              >
                <Edit3 size={16}/>
              </button>
            </div>
            <p>{user.about}</p>
          </div>

          {/* Experience */}
          <div className="card profile-section">
            <div className="section-header">
              <h2 className="section-title"><Briefcase size={18} style={{display:'inline',marginRight:8}}/>Experience</h2>
              <div className="flex gap-2">
                <button 
                  className="btn btn-icon btn-ghost"
                  onClick={() => alert('➕ Add Experience\n\nAdd a new position:\n• Job title\n• Company name\n• Employment type\n• Start & end date\n• Location\n• Description\n\nShowcase your professional journey!')}
                >
                  <Plus size={16}/>
                </button>
                <button 
                  className="btn btn-icon btn-ghost"
                  onClick={() => alert('✏️ Edit Experience\n\nSelect a position to edit:\n• Update job details\n• Reorder positions\n• Delete positions\n• Add skills used')}
                >
                  <Edit3 size={16}/>
                </button>
              </div>
            </div>
            <div className="exp-list">
              {user.experience.map(exp => (
                <div key={exp.id} className="exp-item">
                  <div className="exp-logo">{exp.logo}</div>
                  <div className="exp-info">
                    <div className="exp-role">{exp.role}</div>
                    <div className="text-sm text-secondary">{exp.company} · Full-time</div>
                    <div className="text-sm text-muted">{exp.period}</div>
                    <p className="exp-desc">{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card profile-section">
            <div className="section-header">
              <h2 className="section-title"><GraduationCap size={18} style={{display:'inline',marginRight:8}}/>Education</h2>
              <button 
                className="btn btn-icon btn-ghost"
                onClick={() => alert('➕ Add Education\n\nAdd your education:\n• School name\n• Degree & field of study\n• Start & end date\n• Grade (optional)\n• Activities & societies\n• Description\n\nEducation helps build credibility!')}
              >
                <Plus size={16}/>
              </button>
            </div>
            {user.education.map(ed => (
              <div key={ed.id} className="exp-item">
                <div className="exp-logo">🎓</div>
                <div className="exp-info">
                  <div className="exp-role">{ed.school}</div>
                  <div className="text-sm text-secondary">{ed.degree}</div>
                  <div className="text-sm text-muted">{ed.period}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="card profile-section">
            <div className="section-header">
              <h2 className="section-title"><Award size={18} style={{display:'inline',marginRight:8}}/>Skills</h2>
              <button 
                className="btn btn-icon btn-ghost"
                onClick={() => alert('➕ Add Skills\n\nAdd new skills:\n• Technical skills\n• Soft skills\n• Industry knowledge\n• Tools & technologies\n• Languages\n\nTip: Add at least 5 skills to increase profile visibility!\n\nYour connections can endorse your skills to validate your expertise.')}
              >
                <Plus size={16}/>
              </button>
            </div>
            <div className="skills-grid">
              {user.skills.map(skill => (
                <div key={skill} className="skill-pill">{skill}</div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card profile-section">
            <div className="section-header">
              <h2 className="section-title">Activity</h2>
              <span className="text-sm text-secondary">{user.connections.toLocaleString()} followers</span>
            </div>
            {myPosts.length > 0 ? (
              myPosts.map(p => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="empty-state">
                <p>You haven't posted anything yet. Share your thoughts!</p>
                <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create a post</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col */}
        <aside className="profile-right sidebar-sticky">
          <div className="card" style={{ padding: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Profile completeness</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: '78%' }} />
            </div>
            <p className="text-sm text-secondary" style={{ marginTop: 8 }}>78% complete — add a profile photo to reach All-Star status</p>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>People also viewed</div>
            {[
              { name: 'Jordan Kim', headline: 'Staff Engineer @ Meta', initials: 'JK', color: '#7C3AED' },
              { name: 'Aisha Musa', headline: 'AI Researcher @ DeepMind', initials: 'AM', color: '#10b981' },
              { name: 'Chris Park', headline: 'CTO @ Seed Startup', initials: 'CP', color: '#f59e0b' },
            ].map(p => (
              <div key={p.name} className="also-viewed-item">
                <div className="avatar avatar-sm" style={{ background: p.color }}>{p.initials}</div>
                <div>
                  <div className="text-sm font-600">{p.name}</div>
                  <div className="text-xs text-secondary">{p.headline}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
