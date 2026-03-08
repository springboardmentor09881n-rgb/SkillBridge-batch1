import React from 'react';
import { Clock, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
    pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', label: 'Pending' },
    accepted: { bg: '#d1fae5', text: '#065f46', dot: '#10b981', label: 'Accepted' },
    rejected: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Rejected' },
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0.5rem 0' }}>
                    {applications.map((app) => {
                        const st = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;
                        return (
                            <div
                                key={app.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.875rem 1.5rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    transition: 'background 0.15s',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: 'white', fontWeight: '700', fontSize: '0.9375rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {app.volunteerName?.[0]?.toUpperCase() || <User size={16} />}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: '700', fontSize: '0.9375rem',
                                        color: 'var(--text-primary)', overflow: 'hidden',
                                        whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                    }}>
                                        {app.volunteerName}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem', color: 'var(--text-muted)',
                                        marginTop: '2px', overflow: 'hidden',
                                        whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                    }}>
                                        Applied for: <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{app.opportunityTitle}</span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div style={{
                                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
                                    background: st.bg, color: st.text,
                                    padding: '3px 10px', borderRadius: '999px',
                                    fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap',
                                }}>
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: st.dot, flexShrink: 0,
                                    }} />
                                    {st.label}
                                </div>

                                {/* Time */}
                                <div style={{
                                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap',
                                }}>
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
