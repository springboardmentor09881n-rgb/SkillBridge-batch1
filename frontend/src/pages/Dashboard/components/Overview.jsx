import React from 'react';

const Overview = ({ metrics }) => {
    return (
        <div className="overview-section premium-card mb-8">
            <div className="overview-header">
                <h3>Overview</h3>
            </div>
            <div className="impact-grid">
                <div className="impact-card bg-slate">
                    <span className="impact-number text-slate">{metrics.opportunitiesCount}</span>
                    <span className="impact-label text-slate-muted">Active Opportunities</span>
                </div>
                <div className="impact-card bg-emerald">
                    <span className="impact-number text-emerald">{metrics.applicationsCount}</span>
                    <span className="impact-label text-emerald-muted">Applications</span>
                </div>
                <div className="impact-card bg-indigo">
                    <span className="impact-number text-indigo">{metrics.activeVolunteersCount}</span>
                    <span className="impact-label text-indigo-muted">Active Volunteers</span>
                </div>
                <div className="impact-card bg-amber">
                    <span className="impact-number text-amber">{metrics.pendingApplicationsCount}</span>
                    <span className="impact-label text-amber-muted">Pending Applications</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
