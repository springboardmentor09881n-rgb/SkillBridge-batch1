import React from 'react';
import { Clock, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RecentApplications.css';

const STATUS_CONFIG = {
    pending: { className: 'status-pending', label: 'Pending' },
    accepted: { className: 'status-accepted', label: 'Accepted' },
    rejected: { className: 'status-rejected', label: 'Rejected' },
};

const RecentApplications = ({ applications }) => {
    const navigate = useNavigate();

    return (
        <div className="overview-section">
            <div className="overview-header flex justify-between items-center">
                <h3>Recent Applications</h3>
                <button
                    className="view-all-btn-small"
                    onClick={() => navigate('/ngo/applications')}
                >
                    View All <ArrowRight size={13} style={{ display: 'inline', marginLeft: '2px' }} />
                </button>
            </div>

            {applications.length > 0 ? (
                <div className="recent-apps-container">
                    {applications.map((app) => {
                        const st = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;
                        return (
                            <div
                                key={app.id}
                                className="recent-app-item"
                            >
                                {/* Avatar */}
                                <div className="app-avatar">
                                    {app.volunteerName?.[0]?.toUpperCase() || <User size={16} />}
                                </div>
 
                                {/* Info */}
                                <div className="app-info">
                                    <div className="app-volunteer-name">
                                        {app.volunteerName}
                                    </div>
                                    <div className="app-opportunity-title">
                                        Applied for: <span>{app.opportunityTitle}</span>
                                    </div>
                                </div>
 
                                {/* Status badge */}
                                <div className={`status-badge-container ${st.className}`}>
                                    <span className="status-dot" />
                                    {st.label}
                                </div>
 
                                {/* Time */}
                                <div className="app-time">
                                    <Clock size={12} />
                                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>

            ) : (
                <div className="empty-state" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent applications yet.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>When volunteers apply, they'll appear here.</p>
                </div>
            )}
        </div>
    );
};

export default RecentApplications;
