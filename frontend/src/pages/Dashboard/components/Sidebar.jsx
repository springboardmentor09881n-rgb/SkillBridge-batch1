import React from 'react';
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

    // Default letter if missing
    const initials = organization?.name ? organization.name.charAt(0).toUpperCase() : 'O';

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
        { id: 'opportunities', label: 'Opportunities', icon: Award },
        { id: 'applications', label: 'Applications', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <aside className="user-sidebar w-80">
            <div className="premium-card overflow-hidden sidebar-card">

                {/* Profile Header matching UserSidebar.jsx */}
                <div className="profile-header flex items-center gap-5 p-6 border-b border-[var(--border-color)]">
                    <div className="avatar-circle w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="profile-info overflow-hidden min-w-0 flex-1">
                        <h3 className="m-0 text-lg font-semibold text-[var(--text-primary)] truncate" title={organization?.name}>{organization?.name || 'NGO'}</h3>
                        <p className="profile-role-subtext text-sm text-[var(--text-muted)] mt-1 truncate" title="NGO">{organization?.iam || 'ngo'}</p>
                    </div>
                </div>

                {/* NGO Nav items */}
                <div className="sidebar-section p-4 border-b border-[var(--border-color)]">
                    <div className="sidebar-menu-card">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => navigate(`/ngo/${item.id}`)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Restored Organization Info section replacing Skills/Activity */}
                <div className="sidebar-section p-6">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Organization Info</h4>

                    <div className="flex flex-col gap-4 text-sm text-[var(--text-secondary)]" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MapPin size={16} className="text-[var(--text-muted)] shrink-0" />
                            <span className="truncate" title={organization?.location || ''}>{organization?.location || 'Location not set'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Globe size={16} className="text-[var(--text-muted)] shrink-0" />
                            {organization?.websiteUrl ? (
                                <a href={organization.websiteUrl.startsWith('http') ? organization.websiteUrl : `https://${organization.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-600 cursor-pointer transition-colors" title={organization.websiteUrl}>
                                    {organization.websiteUrl.replace(/^https?:\/\//, '')}
                                </a>
                            ) : (
                                <span className="truncate">Website not set</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Mail size={16} className="text-[var(--text-muted)] shrink-0" />
                            <span className="truncate" title={organization?.email || ''}>{organization?.email || 'Email not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section p-6 border-t border-[var(--border-color)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Recent Activity</h4>
                    {recentActivity && recentActivity.length > 0 ? (
                        <div className="sidebar-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="sidebar-activity-item" style={{ display: 'flex', gap: '12px' }}>
                                    <div className="sidebar-activity-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div className="sidebar-activity-content">
                                        <p className="sidebar-activity-text text-sm font-medium text-[var(--text-primary)]" style={{ margin: 0 }}>{activity.text}</p>
                                        <span className="sidebar-activity-date text-xs text-[var(--text-muted)]" style={{ display: 'block', marginTop: '4px' }}>{activity.date}</span>
                                    </div>
                                </div>
                            ))}
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
