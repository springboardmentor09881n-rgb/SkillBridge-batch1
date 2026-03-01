import React from "react";
import { Bell, User, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";

const Header = ({ role }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { tab, action } = useParams(); // Extract activeTab and action from URL parameters
    const activeTab = tab || location.pathname.split('/').pop();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Support all variations of NGO role that might be returned
    const isNgo = role === 'NGO' || role === 'ngo/organization' || role === 'ngo';
    const basePath = isNgo ? '/ngo' : '/volunteer';

    const navItems = isNgo
        ? ["Dashboard", "Opportunities", "Applications", "Messages"]
        : ["Dashboard", "Opportunities", "Messages"];

    return (
        <nav className="dashboard-navbar">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo ml-8">
                        SkillBridge
                    </Link>
                </div>

                <div className="navbar-center">
                    {navItems.map((item) => {
                        const id = item.toLowerCase();
                        const isActive = activeTab === id || (id === 'opportunities' && (action === 'createopportunities' || action === 'details'));
                        return (
                            <Link
                                key={item}
                                to={`${basePath}/${id}`}
                                className={`navbar-link ${isActive ? 'active' : ''}`}
                            >
                                {item}
                            </Link>
                        );
                    })}
                </div>

                <div className="navbar-right">
                    <button className="navbar-icon-btn profile-btn" onClick={toggleTheme} title="Toggle Theme">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <span className={`navbar-role-badge ${isNgo ? 'ngo-badge' : 'volunteer-badge'}`}>
                        {isNgo ? 'NGO' : 'Volunteer'}
                    </span>
                    <div
                        className="navbar-icon-btn profile-btn"
                        onClick={() => navigate(`${basePath}/profile`)}
                        title="Profile"
                    >
                        <User size={18} />
                    </div>
                    <button className="navbar-icon-btn bell-btn" title="Notifications">
                        <Bell size={20} />
                        <span className="bell-dot"></span>
                    </button>
                    <button className="navbar-icon-btn profile-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
