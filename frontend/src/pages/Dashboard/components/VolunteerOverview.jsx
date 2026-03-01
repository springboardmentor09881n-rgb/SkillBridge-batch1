import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';

const VolunteerOverview = ({ profile, applicationsCount = 0, acceptedCount = 0, pendingCount = 0 }) => {
    const navigate = useNavigate();

    return (
        <div className="volunteer-overview">
            {/* Find Opportunities Call-to-Action */}
            <div className="find-opp-card">
                <h2>
                    Find Opportunities
                </h2>
                <p>
                    Discover volunteering opportunities that match your skills and interests.
                </p>
                <div style={{ width: '100%' }}>
                    <Button
                        onClick={() => navigate('/volunteer/opportunities')}
                        style={{ width: '100%', display: 'block', textAlign: 'center' }}
                    >
                        Browse All Opportunities
                    </Button>
                </div>
            </div>

            {/* Your Impact Section */}
            <div className="overview-section">
                <div className="overview-header">
                    <h3>Your Impact</h3>
                </div>
                <div className="impact-grid">
                    <div className="impact-card bg-slate">
                        <span className="impact-number text-slate">{applicationsCount}</span>
                        <span className="impact-label text-slate-muted">Applications</span>
                    </div>
                    <div className="impact-card bg-emerald">
                        <span className="impact-number text-emerald">{acceptedCount}</span>
                        <span className="impact-label text-emerald-muted">Accepted</span>
                    </div>
                    <div className="impact-card bg-amber">
                        <span className="impact-number text-amber">{pendingCount}</span>
                        <span className="impact-label text-amber-muted">Pending</span>
                    </div>
                    <div className="impact-card bg-indigo">
                        <span className="impact-number text-indigo">{profile.skills ? profile.skills.length : 0}</span>
                        <span className="impact-label text-indigo-muted">Skills</span>
                    </div>
                </div>
            </div>

            {/* Recent Messages Section */}
            <div className="overview-section">
                <div className="overview-header">
                    <h3>Recent Messages</h3>
                </div>
                <div className="messages-body">
                    <p className="empty-messages-text">No recent messages</p>
                    <button
                        className="view-messages-btn"
                        onClick={() => navigate('/volunteer/messages')}
                    >
                        View All Messages
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VolunteerOverview;
