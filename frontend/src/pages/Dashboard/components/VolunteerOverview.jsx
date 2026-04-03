import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import StatCard from './StatCard';
import { FileCheck, CheckCircle, Hourglass, Award } from 'lucide-react';

const VolunteerOverview = ({ profile, applicationsCount = 0, acceptedCount = 0, pendingCount = 0, skillsCount = 0, recentMessages = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="volunteer-overview">
            {/* Smart Match Suggestion for New Volunteers */}
            {applicationsCount === 0 && (
                <div className="smart-match-card" style={{ marginBottom: '1.5rem' }} onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-smart-match'));
                }}>
                    <div className="smart-match-content">
                        <div className="smart-match-icon-wrap">
                            <Award className="sparkle-icon" size={24} />
                        </div>
                        <div className="smart-match-text">
                            <h3>Discover Your Perfect Match</h3>
                            <p>New to SkillBridge? Our AI-powered Smart Match finds opportunities tailored specifically to your profile. Click the sparkles in the corner to see your matches!</p>
                        </div>
                    </div>
                </div>
            )}

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
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', paddingLeft: '0.25rem' }}>Your Impact</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <StatCard 
                        title="Applications" 
                        value={applicationsCount} 
                        icon={FileCheck} 
                        variant="blue" 
                    />
                    <StatCard 
                        title="Accepted" 
                        value={acceptedCount} 
                        icon={CheckCircle} 
                        variant="green" 
                    />
                    <StatCard 
                        title="Pending" 
                        value={pendingCount} 
                        icon={Hourglass} 
                        variant="amber" 
                    />
                    <StatCard 
                        title="Skills" 
                        value={skillsCount} 
                        icon={Award} 
                        variant="indigo" 
                    />
                </div>
            </div>

            {/* Recent Messages Section */}
            <div className="overview-section">
                <div className="overview-header">
                    <h3>Recent Messages</h3>
                </div>
                <div className="messages-body">
                    {recentMessages && recentMessages.length > 0 ? (
                        <div className="recent-messages-list">
                            {recentMessages.map((msg, idx) => (
                                <div key={idx} className="overview-message-item">
                                    <div className="msg-sender-name">{msg.senderName || 'Sender'}</div>
                                    <div className="msg-preview-text">{msg.content?.slice(0, 80)}{msg.content?.length > 80 ? '...' : ''}</div>
                                    <div className="msg-timestamp">{new Date(msg.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-messages-text">No recent messages</p>
                    )}
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
