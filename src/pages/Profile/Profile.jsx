import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, MapPin, Shield, Brain,
    Building2, Globe, FileText, ArrowLeft
} from 'lucide-react';
import { getProfile } from '../../services/api';
import './Profile.css';

const Profile = () => {
    const { user: authUser, isLoading: authLoading } = useAuth();
    const [profileData, setProfileData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchProfile = async () => {
            const result = await getProfile();
            if (result.success) {
                setProfileData(result.user);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    if (authLoading || loading) return <div className="loading-screen">Loading Profile...</div>;

    if (error || !profileData) {
        return (
            <div className="profile-error-container">
                <h2>{error || 'No Session Found'}</h2>
                <p>Please log in to view your profile.</p>
                <button onClick={() => navigate('/login')}>Sign In</button>
            </div>
        );
    }

    const user = profileData;
    const isVolunteer = user.role === 'Volunteer';

    return (
        <div className="profile-page-container">
            <div className="profile-header-section">
                <div className="container">
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="profile-hero">
                        <div className="profile-avatar-large">
                            {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : user.username[0].toUpperCase()}
                        </div>
                        <div className="profile-hero-info">
                            <h1>{user.full_name || user.username}</h1>
                            <p className="profile-username">@{user.username}</p>
                            <span className="profile-role-badge">{user.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="profile-content container">
                <div className="profile-grid">
                    {/* Basic Information Card */}
                    <div className="profile-card basic-info">
                        <h3>Basic Information</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <div className="info-icon"><Mail size={18} /></div>
                                <div className="info-text">
                                    <label>Email</label>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><MapPin size={18} /></div>
                                <div className="info-text">
                                    <label>Location</label>
                                    <span>{user.location || 'Not Specified'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Shield size={18} /></div>
                                <div className="info-text">
                                    <label>Account Type</label>
                                    <span>{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Card */}
                    {isVolunteer ? (
                        <div className="profile-card expertise-card">
                            <div className="card-header-icon"><Brain size={24} /></div>
                            <h3>Skills & Expertise</h3>
                            <div className="skills-tags-container">
                                {user.skills ? user.skills.split(',').map((skill, index) => (
                                    <span key={index} className="profile-skill-tag">{skill.trim()}</span>
                                )) : <p className="empty-text">No skills added yet.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="profile-card organization-card">
                            <div className="card-header-icon"><Building2 size={24} /></div>
                            <h3>Organization Details</h3>
                            <div className="info-list">
                                <div className="info-item">
                                    <div className="info-icon"><Building2 size={18} /></div>
                                    <div className="info-text">
                                        <label>Organization Name</label>
                                        <span>{user.organization_name || 'Not Specified'}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><Globe size={18} /></div>
                                    <div className="info-text">
                                        <label>Website</label>
                                        <a href={user.website_url} target="_blank" rel="noopener noreferrer">
                                            {user.website_url || 'Not Specified'}
                                        </a>
                                    </div>
                                </div>
                                <div className="info-item full-width">
                                    <div className="info-icon"><FileText size={18} /></div>
                                    <div className="info-text">
                                        <label>Mission / Description</label>
                                        <p>{user.organization_description || 'No description provided.'}</p>
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
