import React from 'react';

const RecentApplications = ({ applications }) => {
    return (
        <div className="recent-applications">
            <div className="card-header-flex">
                <h3 className="card-title">Recent Applications</h3>
                <button className="view-all-btn">View All</button>
            </div>

            {applications.length > 0 ? (
                <div className="apps-list">
                    {applications.map((app) => (
                        <div key={app.id} className="app-item">
                            <div className="app-item-main">
                                <div className="app-item-info">
                                    <div className="app-person">
                                        <h4>{app.volunteerName}</h4>
                                        <div className={`status-badge status-${app.status}`}>
                                            {app.status}
                                        </div>
                                    </div>
                                    <span className="app-opportunity">Applied for: {app.opportunityTitle}</span>
                                </div>
                                <div className="app-message-box">
                                    <p className="app-message">{app.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No recent applications yet.</p>
                </div>
            )}
        </div>
    );
};

export default RecentApplications;
