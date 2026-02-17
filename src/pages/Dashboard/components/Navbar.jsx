import React from 'react';
import { Bell, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ role, activeTab, setActiveTab }) => {
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
        { id: 'applications', label: 'Applications' },
        { id: 'messages', label: 'Messages' },
    ];

    return (
        <nav className="dashboard-navbar">
            <div className="navbar-left">
                <span className="logo-text">SkillBridge</span>
            </div>

            <div className="navbar-center">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <div className="navbar-right">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="role-badge-container">
                    <span className="role-badge">Ngo</span>
                </div>
                <button className="nav-icon-btn">
                    <Bell size={20} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
