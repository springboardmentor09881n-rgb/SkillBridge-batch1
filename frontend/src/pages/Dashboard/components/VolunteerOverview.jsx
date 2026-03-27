import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import StatCard from './StatCard';
import { FileCheck, CheckCircle, Hourglass, Award } from 'lucide-react';

const VolunteerOverview = ({ profile, applicationsCount = 0, acceptedCount = 0, pendingCount = 0, skillsCount = 0 }) => {
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
            <div style={{ marginBottom: '0.5rem' }}>
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
