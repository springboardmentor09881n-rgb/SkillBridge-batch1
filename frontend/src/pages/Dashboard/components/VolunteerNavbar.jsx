import React from 'react';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from './NotificationPanel';

const VolunteerNavbar = ({ activeTab, unreadCount }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'opportunities', label: 'Opportunities' },
        { id: 'messages', label: 'Messages' }
    ];

    return (
        <nav className="v-navbar">
            <div className="v-navbar-inner">
                <div className="v-nav-left">
                    <span className="v-logo">SkillBridge</span>
                </div>
                <div className="v-nav-links">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`v-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => navigate(`/volunteer/${tab.id}`)}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                <div className="v-nav-right">
                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="v-icon-btn" onClick={() => navigate('/volunteer/profile')} title="Profile">
                        <User size={20} />
                    </div>
                    <span className="v-user-role">Volunteer</span>
                    <NotificationPanel />
                    <div className="v-icon-btn logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={20} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default VolunteerNavbar;
