import { useState } from 'react';
import { Search, MapPin, Clock, Users, Bookmark, BookmarkCheck, Zap, Plus, X, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Jobs.css';

const EMOJI_OPTIONS = ['🌾', '🚜', '🐄', '🌽', '💧', '📦', '🏆', '🌹', '🌱', '🍎'];
const AGRI_BENEFITS = [
  '🏡 On-Farm Housing Provided',
  '🚜 Field Transport Provided',
  '🏥 Farm Health & Safety Insurance',
  '🌾 Harvest Performance Bonus',
  '🎓 Agri-Tech Training & GAP Certification',
  '☀️ Off-Season Paid Leave',
];

function PostJobModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salary, setSalary] = useState('');
  const [logo, setLogo] = useState('🌾');
  const [skillsStr, setSkillsStr] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [customBenefit, setCustomBenefit] = useState('');

  const toggleBenefit = (b) => {
    setSelectedBenefits(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const handleAddCustomBenefit = (e) => {
    e.preventDefault();
    if (!customBenefit.trim()) return;
    const formatted = customBenefit.trim();
    if (!selectedBenefits.includes(formatted)) {
      setSelectedBenefits(prev => [...prev, formatted]);
    }
    setCustomBenefit('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    onSubmit({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || 'Remote',
      type,
      salary: salary.trim() || 'Negotiable',
      logo,
      skills: skills.length > 0 ? skills : ['Agriculture', 'Farm Management'],
      benefits: selectedBenefits,
      description: desc.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal animate-slideUp" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Briefcase size={18} color="var(--primary-light)" />
            <h3 style={{ margin: 0 }}>Post an Agricultural Job</h3>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Logo Emoji picker */}
          <div className="input-group">
            <label className="input-label text-xs">Select Category Icon</label>
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map(em => (
                <button
                  type="button"
                  key={em}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 18, border: logo === em ? '2px solid var(--primary-light)' : '1px solid var(--border-color)' }}
                  onClick={() => setLogo(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label text-xs">Job Title *</label>
            <input className="input" placeholder="e.g. Senior Farm Manager" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="flex gap-3">
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label text-xs">Company / Farm Name *</label>
              <input className="input" placeholder="e.g. Sunridge Estates" value={company} onChange={e => setCompany(e.target.value)} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label text-xs">Location</label>
              <input className="input" placeholder="e.g. Nakuru, Kenya or Remote" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label text-xs">Job Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label text-xs">Salary / Pay Range</label>
              <input className="input" placeholder="e.g. USD 2,500 – 3,500/mo" value={salary} onChange={e => setSalary(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label text-xs">Required Skills (comma separated)</label>
            <input className="input" placeholder="e.g. Agronomy, Drip Irrigation, Crop Scouting" value={skillsStr} onChange={e => setSkillsStr(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label text-xs">Farm Benefits & Perks (Optional - Select or Add)</label>
            <div className="flex gap-2 mb-2">
              <input
                className="input"
                placeholder="Type a custom benefit (e.g. Free Meals, Overtime Pay)..."
                value={customBenefit}
                onChange={e => setCustomBenefit(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomBenefit(e); } }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCustomBenefit}>
                Add
              </button>
            </div>

            {/* Suggested / Selected benefits list */}
            <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
              {AGRI_BENEFITS.map(b => (
                <button
                  type="button"
                  key={b}
                  className="benefit-tag"
                  style={{
                    cursor: 'pointer',
                    background: selectedBenefits.includes(b) ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-input)',
                    border: selectedBenefits.includes(b) ? '1px solid var(--primary-light)' : '1px solid var(--border-color)',
                    color: selectedBenefits.includes(b) ? 'var(--primary-light)' : 'var(--text-secondary)',
                  }}
                  onClick={() => toggleBenefit(b)}
                >
                  {selectedBenefits.includes(b) ? '✓ ' : ''}{b}
                </button>
              ))}

              {selectedBenefits.filter(b => !AGRI_BENEFITS.includes(b)).map(b => (
                <button
                  type="button"
                  key={b}
                  className="benefit-tag"
                  style={{
                    cursor: 'pointer',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid var(--primary-light)',
                    color: 'var(--primary-light)',
                  }}
                  onClick={() => toggleBenefit(b)}
                >
                  ✓ {b} <X size={12} style={{ marginLeft: 4 }} />
                </button>
              ))}
            </div>
            <div className="text-xs text-muted mt-1">
              {selectedBenefits.length === 0 ? 'No benefits selected' : `${selectedBenefits.length} benefit(s) selected`}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label text-xs">Job Description</label>
            <textarea className="input" rows={4} placeholder="Describe the role responsibilities and requirements..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'none' }} />
          </div>

          <div className="modal-footer" style={{ padding: '12px 0 0' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim() || !company.trim()}>
              <Plus size={16} /> Post Job Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplyJobModal({ job, user, onClose, onSubmit }) {
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      coverNote: coverNote.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal animate-slideUp" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Apply to {job.company}</h3>
            <div className="text-xs text-secondary">{job.title} · {job.location}</div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label text-xs">Full Name *</label>
            <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label text-xs">Email Address *</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label text-xs">Phone Number</label>
            <input className="input" placeholder="e.g. +233 24 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label text-xs">Brief Note / Qualifications</label>
            <textarea className="input" rows={3} placeholder="Briefly highlight your relevant agricultural experience..." value={coverNote} onChange={e => setCoverNote(e.target.value)} style={{ resize: 'none' }} />
          </div>
          <div className="modal-footer" style={{ padding: '12px 0 0' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Zap size={16} /> Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { jobs, toggleSaveJob, postNewJob, applyForJob, user } = useApp();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handlePostJobSubmit = async (jobData) => {
    const created = await postNewJob(jobData);
    if (created) {
      setSelectedJobId(created.id);
    }
    setShowPostModal(false);
  };

  const handleApplySubmit = (applicationData) => {
    if (selectedJob) {
      applyForJob(selectedJob.id, applicationData);
    }
    setShowApplyModal(false);
  };

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchLocation && matchType;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="jobs-header flex justify-between items-center mb-4">
        <div>
          <h1 style={{ margin: 0 }}>Find Your Next Role</h1>
          <p className="text-secondary" style={{ margin: '4px 0 0' }}>Discover {jobs.length}+ curated opportunities matched to your profile</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Filters */}
      <div className="card jobs-filters">
        <div className="jobs-search-wrap">
          <Search size={16} className="filter-icon" />
          <input className="input jobs-search-input" placeholder="Job title, company…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="jobs-search-wrap">
          <MapPin size={16} className="filter-icon" />
          <input className="input jobs-search-input" placeholder="Location or Remote…" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
        </div>
        <div className="jobs-type-filters">
          {['All', 'Full-time', 'Contract', 'Part-time'].map(t => (
            <button key={t} className={`type-filter-btn ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="jobs-layout">
        {/* Job list */}
        <div className="jobs-list">
          <div className="jobs-count text-sm text-secondary" style={{ marginBottom: 12 }}>{filtered.length} results</div>
          {filtered.map(job => (
            <div
              key={job.id}
              className={`card job-list-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
              onClick={() => setSelectedJobId(job.id)}
            >
              <div className="job-list-logo">{job.logo}</div>
              <div className="job-list-info">
                <div className="job-title">{job.title}</div>
                <div className="text-sm text-secondary">{job.company}</div>
                <div className="job-meta">
                  <span><MapPin size={12}/> {job.location}</span>
                  <span><Clock size={12}/> {job.posted}</span>
                </div>
                {job.easy && <span className="easy-apply-tag"><Zap size={11}/> Easy Apply</span>}
              </div>
              <button
                className="btn btn-icon btn-ghost save-btn"
                onClick={e => { e.stopPropagation(); toggleSaveJob(job.id); }}
                title={job.saved ? 'Unsave' : 'Save'}
              >
                {job.saved ? <BookmarkCheck size={16} color="var(--primary-light)"/> : <Bookmark size={16}/>}
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={40} color="var(--text-muted)" />
              <p style={{ marginTop: 12 }}>No jobs match your search</p>
            </div>
          )}
        </div>

        {/* Job detail */}
        {selectedJob && (
          <div className="job-detail card">
            <div className="job-detail-header">
              <div className="job-detail-logo">{selectedJob.logo}</div>
              <div>
                <h2 className="job-detail-title">{selectedJob.title}</h2>
                <div className="text-secondary">{selectedJob.company}</div>
              </div>
            </div>

            <div className="job-detail-meta">
              <div className="job-detail-meta-item"><MapPin size={15}/> {selectedJob.location}</div>
              <div className="job-detail-meta-item"><Zap size={15}/> {selectedJob.type}</div>
              <div className="job-detail-meta-item"><Users size={15}/> {selectedJob.applicants} applicants</div>
              <div className="job-detail-meta-item"><Clock size={15}/> Posted {selectedJob.posted}</div>
            </div>

            <div className="job-salary-badge">{selectedJob.salary} / yr</div>

            <div className="job-detail-actions">
              {selectedJob.applied ? (
                <button className="btn btn-primary btn-lg" disabled style={{ background: '#10b981', opacity: 0.9 }}>
                  ✓ Applied
                </button>
              ) : selectedJob.easy ? (
                <button className="btn btn-primary btn-lg" onClick={() => setShowApplyModal(true)}>
                  <Zap size={16}/> Easy Apply
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={() => setShowApplyModal(true)}>
                  Apply Now
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => toggleSaveJob(selectedJob.id)}
                style={{
                  color: selectedJob.saved ? 'var(--primary-light)' : 'inherit',
                  borderColor: selectedJob.saved ? 'var(--primary-light)' : undefined,
                }}
              >
                {selectedJob.saved ? <><BookmarkCheck size={16} color="var(--primary-light)"/> Saved</> : <><Bookmark size={16}/> Save</>}
              </button>
            </div>

            <hr className="divider" />

            <h3 style={{ marginBottom: 12 }}>About the role</h3>
            <p>We're looking for a talented <strong>{selectedJob.title}</strong> to join our growing team at <strong>{selectedJob.company}</strong>. You'll be working on cutting-edge technology with a world-class team.</p>

            <h3 style={{ margin: '20px 0 12px' }}>Required Skills</h3>
            <div className="job-skills">
              {selectedJob.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
            </div>

            <h3 style={{ margin: '20px 0 12px' }}>Responsibilities</h3>
            <ul className="job-bullets">
              <li>Manage daily farm operations, field scouting, and crop health monitoring</li>
              <li>Oversee irrigation schedules, soil moisture testing, and fertigation</li>
              <li>Supervise field team workers during planting, weeding, and harvest seasons</li>
              <li>Maintain compliance with Good Agricultural Practices (GAP) & safety standards</li>
              <li>Monitor pest/disease pressure and implement Integrated Pest Management (IPM)</li>
            </ul>

            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
              <>
                <h3 style={{ margin: '20px 0 12px' }}>Benefits & Perks</h3>
                <div className="job-benefits">
                  {selectedJob.benefits.map(b => (
                    <span key={b} className="benefit-tag">{b}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showPostModal && (
        <PostJobModal onClose={() => setShowPostModal(false)} onSubmit={handlePostJobSubmit} />
      )}

      {showApplyModal && selectedJob && (
        <ApplyJobModal job={selectedJob} user={user} onClose={() => setShowApplyModal(false)} onSubmit={handleApplySubmit} />
      )}
    </div>
  );
}
