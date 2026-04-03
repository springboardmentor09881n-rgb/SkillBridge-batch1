import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile, getProfile } from '../../../services/api';

// Safely parse skills regardless of format (array, JSON string, or CSV string)
const parseSkills = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return raw.split(',').map(s => s.trim()).filter(Boolean); }
    }
    return [];
};

const UserSidebar = ({ profile, recentActivity = [] }) => {
    const { user: authUser, updateUser } = useAuth();
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showAllActivity, setShowAllActivity] = useState(false);

    // Initialize from profile prop (which comes from auth context), parsed safely
    const [localSkills, setLocalSkills] = useState(() => parseSkills(profile.skills));

    // On mount, fetch fresh profile from API to ensure skills are up to date
    useEffect(() => {
        const loadFreshSkills = async () => {
            const result = await getProfile();
            if (result.success && result.data) {
                const freshSkills = parseSkills(result.data.skills);
                setLocalSkills(freshSkills);
                // Keep auth context in sync
                updateUser({ skills: freshSkills, fullName: result.data.fullName, location: result.data.location });
            }
        };
        loadFreshSkills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddSkill = async () => {
        if (newSkill.trim() && !isSaving) {
            const skillToAdd = newSkill.trim();
            const updatedSkillsArray = [...localSkills, skillToAdd];

            // Optimistic UI updates
            setLocalSkills(updatedSkillsArray);
            setNewSkill('');
            setIsAddingSkill(false);
            setIsSaving(true);

            try {
                const response = await updateProfile({ skills: updatedSkillsArray });

                if (response.success) {
                    // Prepend new activity
                    const newActivity = {
                        id: Date.now(),
                        text: `Added a new skill: ${skillToAdd}`,
                        date: 'Just now'
                    };

                    const updatedActivityLog = authUser?.recentActivity
                        ? [newActivity, ...authUser.recentActivity].slice(0, 5) // Keep last 5
                        : [newActivity];

                    updateUser({
                        skills: updatedSkillsArray,
                        recentActivity: updatedActivityLog
                    });
                } else {
                    // Revert on failure
                    console.error("Failed to update profile skills:", response.message);
                    setLocalSkills(localSkills);
                }
            } catch (error) {
                console.error("Error adding skill:", error);
                setLocalSkills(localSkills);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <aside className="user-sidebar w-80">
            <div className="profile-card rounded-xl overflow-hidden shadow-md" style={{ height: 'fit-content', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <div className="profile-header flex items-center gap-5 p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="v-profile-circle" style={{ backgroundColor: '#2563eb', color: '#ffffff', width: '4rem', height: '4rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', flexShrink: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        {profile.initials}
                    </div>
                    <div className="profile-info overflow-hidden min-w-0 flex-1">
                        <h3 className="m-0 text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={profile.name}>{profile.name}</h3>
                        <p className="profile-role-subtext text-sm mt-1 capitalize truncate" style={{ color: 'var(--text-secondary)' }} title={profile.iam}>{profile.iam}</p>
                    </div>
                </div>

                <div className="sidebar-section p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Your Skills</h4>

                    <div className="skills-list flex items-center gap-2 flex-wrap mb-3">
                        {localSkills.length > 0 ? (
                            localSkills.map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))
                        ) : (
                            <p className="empty-text text-sm text-[var(--text-muted)] m-0">No skills added yet</p>
                        )}
                    </div>

                    {isAddingSkill && createPortal(
                        <div className="add-skill-modal-overlay">
                                <div className="add-skill-modal-content" style={{ 
                                    background: 'rgba(255, 255, 255, 0.95)', 
                                    backdropFilter: 'blur(32px)', 
                                    WebkitBackdropFilter: 'blur(32px)', 
                                    borderRadius: '2rem', 
                                    padding: '3.5rem 2.5rem', 
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                        <Plus style={{ color: '#2563eb' }} size={24} /> Add a New Skill
                                    </h3>
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="e.g. Graphic Design"
                                    className="add-skill-input"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                />
                                <div className="add-skill-actions">
                                    <button
                                        onClick={() => { setIsAddingSkill(false); setNewSkill(''); }}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSkill}
                                        className="btn-add"
                                    >
                                        Add Skill
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
                    <button
                        onClick={() => setIsAddingSkill(true)}
                        className="add-skills-btn mt-1 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Plus size={14} /> Add Skills
                    </button>
                </div>

                <div className="sidebar-section p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Activity</h4>

                    {recentActivity && recentActivity.length > 0 ? (
                        <div className="sidebar-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentActivity.slice(0, showAllActivity ? recentActivity.length : 3).map((activity) => (
                                <div key={activity.id} className="sidebar-activity-item">
                                    <div className="sidebar-activity-dot"></div>
                                    <div className="sidebar-activity-content">
                                        <p className="sidebar-activity-text">{activity.text}</p>
                                        <span className="sidebar-activity-date">{activity.date}</span>
                                    </div>
                                </div>
                            ))}

                            {recentActivity.length > 3 && (
                                <button 
                                    onClick={() => setShowAllActivity(p => !p)}
                                    className="view-more-btn"
                                >
                                    {showAllActivity ? 'Show Less' : `View More (${recentActivity.length - 3} more)`}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="empty-text text-sm text-[var(--text-muted)] m-0 mt-2">No recent activity</p>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default UserSidebar;
