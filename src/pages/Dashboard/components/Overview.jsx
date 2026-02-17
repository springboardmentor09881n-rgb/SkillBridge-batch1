import React from 'react';

const Overview = ({ metrics }) => {
    const cards = [
        { label: 'Active Opportunities', value: metrics.opportunitiesCount, type: 'blue' },
        { label: 'Applications', value: metrics.applicationsCount, type: 'green' },
        { label: 'Active Volunteers', value: metrics.activeVolunteersCount, type: 'purple' },
        { label: 'Pending Applications', value: metrics.pendingApplicationsCount, type: 'yellow' },
    ];

    return (
        <div className="metrics-grid">
            {cards.map((card, index) => (
                <div key={index} className={`metric-card ${card.type}`}>
                    <div className="metric-value">{card.value}</div>
                    <div className="metric-label">{card.label}</div>
                </div>
            ))}
        </div>
    );
};

export default Overview;
