import React from 'react';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VolunteerNavbar = ({ activeTab, setActiveTab }) => {
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
        { id: 'messages', label: 'Messages' },
        { id: 'profile', label: 'Profile' }
    ];

    return (
        <nav className="v-navbar">
            <div className="v-nav-left">
                <span className="v-logo">SkillBridge</span>
            </div>
            <div className="v-nav-links">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`v-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => {
                            if (tab.id === 'profile') {
                                navigate('/profile');
                            } else {
                                setActiveTab(tab.id);
                            }
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className="v-nav-right">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <span className="v-user-role">Volunteer</span>
                <div className="v-icon-btn">
                    <Bell size={20} />
                </div>
                <div className="v-icon-btn logout-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </div>
            </div>
        </nav>
    );
};

export default VolunteerNavbar;
