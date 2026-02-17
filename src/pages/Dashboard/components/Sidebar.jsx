import React from 'react';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    MessageSquare,
    Settings,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = ({ organization, activeTab, setActiveTab }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-header">
                <div className="org-profile-mini">
                    <span className="org-name">{organization.name}</span>
                    <span className="org-role">Ngo</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-menu-card">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="nav-section-label">Organization Info</div>
                <div
                    className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </div>

                <div className="nav-item logout" onClick={handleLogout} style={{ marginTop: 'auto' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
