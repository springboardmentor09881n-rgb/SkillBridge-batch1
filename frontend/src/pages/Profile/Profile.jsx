import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, MapPin, Shield, Brain,
    Building2, Globe, FileText, ArrowLeft, Edit3, Check, X, Briefcase
} from 'lucide-react';
import { getProfile, updateProfile } from '../../services/api';
import './Profile.css';

const Profile = () => {
    const { user: authUser, isLoading: authLoading } = useAuth();
    const [profileData, setProfileData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState({});
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchProfile = async () => {
            const result = await getProfile();
            if (result.success) {
                // Bug fix: response is { success, data } not { success, user }
                setProfileData(result.data);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (authLoading || loading) {
        return (
            <div className="profile-loading">
                <div className="profile-loading-spinner" />
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="profile-error-container">
                <div className="profile-error-icon">
                    <User size={56} strokeWidth={1.5} />
                </div>
                <h2>No Session Found</h2>
                <p>Please log in to view your profile.</p>
                <button onClick={() => navigate('/login')} className="profile-signin-btn">
                    Sign In
                </button>
            </div>
        );
    }

    // Parse skills robustly
    const parseSkills = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { /* ignore */ }
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    };

    const user = {
        ...profileData,
        parsedSkills: parseSkills(profileData.skills)
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditData({
                fullName: user.fullName || '',
                location: user.location || '',
                skills: user.parsedSkills.join(', '),
                bio: user.bio || '',
                organizationName: user.organizationName || '',
                organizationDescription: user.organizationDescription || '',
                websiteUrl: user.websiteUrl || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = {
            ...editData,
            skills: editData.skills
                ? editData.skills.split(',').map(s => s.trim()).filter(Boolean)
                : []
        };
        const result = await updateProfile(payload);
        if (result.success) {
            // Bug fix: response is { success, data } not { success, user }
            setProfileData(result.data);
            setIsEditing(false);
        } else {
            setError(result.message);
        }
        setIsSaving(false);
    };

    const isVolunteer = user.iam === 'volunteer';
    const initials = (user.fullName || user.username || 'U')
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="profile-page-container">

            {/* ── HERO BANNER ─── */}
            <div className="profile-hero-banner">
                <div className="profile-hero-pattern" />
                <div className="profile-hero-inner">
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <div className="profile-hero-body">
                        {/* Avatar */}
                        <div className="profile-avatar-wrap">
                            <div className="profile-avatar-large">{initials}</div>
                            <span className={`avatar-role-ring ${isVolunteer ? 'ring-volunteer' : 'ring-ngo'}`} />
                        </div>

                        {/* Name + meta */}
                        <div className="profile-hero-info">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="fullName"
                                    className="edit-input hero-name-input"
                                    value={editData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Full Name"
                                />
                            ) : (
                                <h1 className="profile-hero-name">{user.fullName || user.username}</h1>
                            )}
                            <p className="profile-username">@{user.username}</p>
                            <div className="profile-badges">
                                <span className={`profile-role-badge ${isVolunteer ? 'badge-volunteer' : 'badge-ngo'}`}>
                                    {isVolunteer ? '🙋 Volunteer' : '🏢 NGO'}
                                </span>
                                {user.location && (
                                    <span className="profile-location-badge">
                                        <MapPin size={12} /> {user.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Edit / Save buttons */}
                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                        <Check size={16} />{isSaving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button className="btn-cancel" onClick={handleEditToggle} disabled={isSaving}>
                                        <X size={16} />Cancel
                                    </button>
                                </>
                            ) : (
                                <button className="btn-edit" onClick={handleEditToggle}>
                                    <Edit3 size={16} />Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ─── */}
            <main className="profile-content container">
                <div className="profile-grid">

                    {/* ── Basic Info Card ── */}
                    <div className="profile-card">
                        <h3 className="card-title"><User size={18} />Basic Information</h3>
                        <div className="info-list">

                            <div className="info-item">
                                <div className="info-icon"><Mail size={16} /></div>
                                <div className="info-text">
                                    <label>Email</label>
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon"><MapPin size={16} /></div>
                                <div className="info-text">
                                    <label>Location</label>
                                    {isEditing ? (
                                        <input type="text" name="location" className="edit-input"
                                            value={editData.location} onChange={handleInputChange}
                                            placeholder="City, Country" />
                                    ) : (
                                        <span>{user.location || 'Not specified'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon"><Shield size={16} /></div>
                                <div className="info-text">
                                    <label>Account Type</label>
                                    {/* Bug fix: was user.role, now user.iam */}
                                    <span className="capitalize">{user.iam === 'ngo' ? 'NGO / Organization' : 'Volunteer'}</span>
                                </div>
                            </div>

                            <div className="info-item info-item-block">
                                <div className="info-icon"><FileText size={16} /></div>
                                <div className="info-text" style={{ flex: 1 }}>
                                    <label>Bio</label>
                                    {isEditing ? (
                                        <textarea name="bio" className="edit-textarea"
                                            value={editData.bio} onChange={handleInputChange}
                                            placeholder="Tell us a bit about yourself…" />
                                    ) : (
                                        <p>{user.bio || 'No bio provided yet.'}</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── Role-specific Card ── */}
                    {isVolunteer ? (
                        <div className="profile-card skills-card">
                            <h3 className="card-title"><Brain size={18} />Skills &amp; Expertise</h3>
                            {isEditing ? (
                                <div className="info-item-block" style={{ marginTop: '0.5rem' }}>
                                    <label className="field-label">Skills (comma-separated)</label>
                                    <input type="text" name="skills" className="edit-input"
                                        value={editData.skills} onChange={handleInputChange}
                                        placeholder="e.g. React, Teaching, Graphic Design" />
                                </div>
                            ) : (
                                <>
                                    {user.parsedSkills.length > 0 ? (
                                        <div className="skills-tags-container">
                                            {user.parsedSkills.map((skill, i) => (
                                                <span key={i} className="profile-skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-skills">
                                            <Briefcase size={32} strokeWidth={1.5} />
                                            <p>No skills added yet.</p>
                                            <button className="btn-add-skill" onClick={handleEditToggle}>
                                                + Add Skills
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Stats row */}
                            {!isEditing && (
                                <div className="skills-stats">
                                    <div className="skill-stat">
                                        <span className="stat-num">{user.parsedSkills.length}</span>
                                        <span className="stat-label">Skills</span>
                                    </div>
                                    <div className="skill-stat">
                                        <span className="stat-num">—</span>
                                        <span className="stat-label">Projects</span>
                                    </div>
                                    <div className="skill-stat">
                                        <span className="stat-num">—</span>
                                        <span className="stat-label">Hours</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="profile-card org-card">
                            <h3 className="card-title"><Building2 size={18} />Organization Details</h3>
                            <div className="info-list">

                                <div className="info-item">
                                    <div className="info-icon"><Building2 size={16} /></div>
                                    <div className="info-text">
                                        <label>Organization Name</label>
                                        {isEditing ? (
                                            <input type="text" name="organizationName" className="edit-input"
                                                value={editData.organizationName} onChange={handleInputChange} />
                                        ) : (
                                            <span>{user.organizationName || 'Not specified'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon"><Globe size={16} /></div>
                                    <div className="info-text">
                                        <label>Website</label>
                                        {isEditing ? (
                                            <input type="url" name="websiteUrl" className="edit-input"
                                                value={editData.websiteUrl} onChange={handleInputChange}
                                                placeholder="https://yourorg.org" />
                                        ) : (
                                            user.websiteUrl
                                                ? <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer">{user.websiteUrl}</a>
                                                : <span>Not specified</span>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item info-item-block">
                                    <div className="info-icon"><FileText size={16} /></div>
                                    <div className="info-text" style={{ flex: 1 }}>
                                        <label>Mission / Description</label>
                                        {isEditing ? (
                                            <textarea name="organizationDescription" className="edit-textarea"
                                                value={editData.organizationDescription} onChange={handleInputChange}
                                                placeholder="Describe your organization's mission…" />
                                        ) : (
                                            <p>{user.organizationDescription || 'No description provided.'}</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Profile;
