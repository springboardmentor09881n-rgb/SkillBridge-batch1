import React from 'react';

const UserSidebar = ({ profile }) => {
    return (
        <aside className="user-sidebar">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-circle">{profile.initials}</div>
                    <div className="profile-info">
                        <h3>{profile.name}</h3>
                        <p className="profile-role-subtext">{profile.role}</p>
                    </div>
                </div>

                <div className="sidebar-section skills-section">
                    <h4>Your Skills</h4>
                    <div className="skills-list">
                        {profile.skills.length > 0 ? (
                            profile.skills.map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))
                        ) : (
                            <p className="empty-text">No skills added yet</p>
                        )}
                    </div>
                    <button className="add-skills-btn">+ Add Skills</button>
                </div>

                <div className="sidebar-section activity-section" style={{ borderTop: '2px solid #f8fafc' }}>
                    <h4>Activity</h4>
                    <p className="empty-text">No recent activity</p>
                </div>
            </div>
        </aside>
    );
};

export default UserSidebar;
