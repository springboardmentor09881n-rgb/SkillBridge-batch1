import React, { useState } from 'react';
import {
    BarChart2,
    Award,
    Users,
    MessageSquare,
    MapPin,
    Globe,
    Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = ({ organization, activeTab, recentActivity = [] }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAllActivity, setShowAllActivity] = useState(false);

    // Default letter if missing
    const initials = organization?.name ? organization.name.charAt(0).toUpperCase() : 'O';

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
        { id: 'opportunities', label: 'Opportunities', icon: Award },
        { id: 'applications', label: 'Applications', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <aside className="user-sidebar" style={{ width: '320px' }}>
            <div className="overflow-hidden" style={{ 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '1rem', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                height: 'fit-content', 
                margin: '24px' 
            }}>

                {/* Profile Header */}
                <div className="profile-header flex items-center gap-5 p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="avatar-circle w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="profile-info overflow-hidden min-w-0 flex-1">
                        <h3 className="m-0 text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={organization?.name}>{organization?.name || 'NGO'}</h3>
                        <p className="profile-role-subtext text-sm mt-1 truncate" style={{ color: 'var(--text-secondary)' }} title="NGO">{organization?.iam || 'ngo'}</p>
                    </div>
                </div>

                {/* NGO Nav items */}
                <div className="sidebar-section p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {navItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                                        background: isActive ? 'var(--color-primary-light)' : 'transparent',
                                    }}
                                    onClick={() => navigate(`/ngo/${item.id}`)}
                                >
                                    <item.icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Restored Organization Info section replacing Skills/Activity */}
                <div className="sidebar-section p-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Organization Info</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)' }} className="text-sm">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={16} className="text-[var(--text-muted)] shrink-0" />
                            <span className="truncate" title={organization?.location || ''}>{organization?.location || 'Location not set'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Globe size={16} className="text-[var(--text-muted)] shrink-0" />
                            {organization?.websiteUrl ? (
                                <a href={organization.websiteUrl.startsWith('http') ? organization.websiteUrl : `https://${organization.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600 cursor-pointer transition-colors" title={organization.websiteUrl}>
                                    {organization.websiteUrl.replace(/^https?:\/\//, '')}
                                </a>
                            ) : (
                                <span className="truncate">Website not set</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={16} className="text-[var(--text-muted)] shrink-0" />
                            <span className="truncate" title={organization?.email || ''}>{organization?.email || 'Email not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section p-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Recent Activity</h4>
                    {recentActivity && recentActivity.length > 0 ? (
                        <div className="sidebar-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentActivity.slice(0, showAllActivity ? recentActivity.length : 3).map((activity) => (
                                <div key={activity.id} className="sidebar-activity-item" style={{ display: 'flex', gap: '12px' }}>
                                    <div className="sidebar-activity-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div className="sidebar-activity-content">
                                        <p className="sidebar-activity-text text-sm font-medium text-slate-700 dark:text-slate-200" style={{ margin: 0 }}>{activity.text}</p>
                                        <span className="sidebar-activity-date text-xs text-slate-400" style={{ display: 'block', marginTop: '4px' }}>{activity.date}</span>
                                    </div>
                                </div>
                            ))}
                            
                            {recentActivity.length > 3 && (
                                <button 
                                    onClick={() => setShowAllActivity(p => !p)}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left mt-1"
                                >
                                    {showAllActivity ? 'Show Less' : `View More (${recentActivity.length - 3} more)`}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="empty-text text-sm text-[var(--text-muted)] m-0">No recent activity</p>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
