import React from 'react';
import Button from '../../../components/common/Button';

const OpportunityFeed = ({ opportunities }) => {
    return (
        <section className="opportunity-feed">
            <div className="find-opp-card">
                <h2>Find Opportunities</h2>
                <p>Discover volunteering opportunities that match your skills and interests.</p>
                <Button className="w-full" style={{ width: '100%' }}>Browse All Opportunities</Button>
            </div>

            {opportunities.map((opp) => (
                <div key={opp.id} className="opp-card">
                    <div className="opp-header">
                        <div>
                            <h3>{opp.title}</h3>
                            <span className="ngo-id">NGO ID: {opp.ngoId}</span>
                        </div>
                        <span className="status-label">{opp.status}</span>
                    </div>
                    <p className="opp-desc">{opp.description}</p>
                    <div className="tag-list">
                        {opp.tags.map((tag, i) => (
                            <span key={i} className="opp-tag">{tag}</span>
                        ))}
                    </div>
                    <a href="#" className="view-details">
                        View details <span>&rsaquo;</span>
                    </a>
                </div>
            ))}
        </section>
    );
};

export default OpportunityFeed;
