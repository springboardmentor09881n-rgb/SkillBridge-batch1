import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './OpportunityDetails.css';

const OpportunityDetails = ({ appliedOpps = [], onApply = () => { } }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Check if the current user is an NGO
    const isNgo = user?.role === 'NGO/Organisation';
    const backRoute = isNgo ? '/ngo/opportunities' : '/volunteer/opportunities';

    // State to manage the opportunity object locally for this view
    const [oppData, setOppData] = useState({
        id: 1,
        title: "Website Redesign for Local Shelter",
        ngoName: "HopeForAll Foundation", // Mock NGO name
        description: "Help us redesign our website to improve our online presence and reach more potential adopters. We're looking for an experienced Web Developer and UI/UX Designer to revamp our outdated platform, making it responsive, accessible, and optimized for converting site visitors into volunteers and donors. You'll be working directly with our communications team to ensure the new design aligns with our brand guidelines.",
        tags: ["Web Development", "UI/UX Design"],
        location: "New York, NY",
        duration: "2-3 weeks",
        status: "Open",
        postedDate: "Oct 24, 2026",
        spots: 2
    });

    const hasApplied = appliedOpps.includes(oppData.id);

    const handleCloseOpp = () => {
        if (window.confirm('Are you sure you want to close this opportunity?')) {
            setOppData(prev => ({ ...prev, status: 'Closed' }));
            alert('Opportunity has been closed successfully.');
        }
    };

    return (
        <div className="opportunity-details-page">
            <button
                onClick={() => navigate(backRoute)}
                className="opp-detail-back-btn"
            >
                <ChevronLeft size={16} />
                Back to Opportunities
            </button>

            <div className="opp-detail-card">
                <div className="opp-detail-header">
                    <h1 className="opp-detail-title">{oppData.title}</h1>
                    <div className="opp-detail-org">
                        {oppData.ngoName}
                    </div>

                    <div className="opp-detail-tags">
                        {oppData.tags.map((tag, idx) => (
                            <span key={idx} className="detail-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="opp-detail-meta">
                    <div className="meta-item">
                        <MapPin size={18} className="meta-icon" />
                        <div>
                            <span>Location</span>
                            <br />
                            <strong>{oppData.location}</strong>
                        </div>
                    </div>
                    <div className="meta-item">
                        <Clock size={18} className="meta-icon" />
                        <div>
                            <span>Duration</span>
                            <br />
                            <strong>{oppData.duration}</strong>
                        </div>
                    </div>
                    <div className="meta-item">
                        <Users size={18} className="meta-icon" />
                        <div>
                            <span>Open Spots</span>
                            <br />
                            <strong>{oppData.spots} Volunteers</strong>
                        </div>
                    </div>
                    <div className="meta-item">
                        <Calendar size={18} className="meta-icon" />
                        <div>
                            <span>Posted</span>
                            <br />
                            <strong>{oppData.postedDate}</strong>
                        </div>
                    </div>
                </div>

                <div className="opp-detail-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="content-section-title" style={{ margin: 0 }}>
                            About the Opportunity
                        </h2>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: oppData.status === 'Open' ? '#dcfce7' : '#fee2e2',
                            color: oppData.status === 'Open' ? '#166534' : '#991b1b'
                        }}>
                            {oppData.status}
                        </span>
                    </div>
                    <p className="content-text">
                        {oppData.description}
                    </p>
                </div>

                <div className="opp-detail-footer">
                    {isNgo ? (
                        <>
                            <button
                                className="btn-edit-opp"
                                onClick={() => navigate('/ngo/opportunities')}
                            >
                                Edit Opportunity
                            </button>
                            {oppData.status === 'Open' && (
                                <button
                                    className="btn-close-opp"
                                    onClick={handleCloseOpp}
                                >
                                    Close Opportunity
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => onApply(oppData.id, oppData.title)}
                            disabled={hasApplied || oppData.status === 'Closed'}
                            className={`btn-apply-now ${hasApplied ? 'applied' : ''}`}
                        >
                            {oppData.status === 'Closed' ? 'Opportunity Closed' : (hasApplied ? <><CheckCircle size={18} /> Applied</> : 'Apply Now')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetails;
