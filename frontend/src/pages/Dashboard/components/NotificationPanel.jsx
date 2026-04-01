import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Info, UserCheck, FileText } from 'lucide-react';
import './NotificationPanel.css';

const TYPE_ICONS = {
    application: <FileText size={15} />,
    status_update: <UserCheck size={15} />,
    general: <Info size={15} />,
};

const TYPE_COLORS = {
    application: '#3b82f6',
    status_update: '#10b981',
    general: '#6366f1',
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// --- MOCK DATA FOR DEMO PURPOSES ---
const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'status_update', message: 'New match found! A volunteer with React skills matches your latest opportunity.', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 2, type: 'general', message: 'You have a new message from Tech for Good (NGO).', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
    { id: 3, type: 'application', message: 'Your application for "Frontend Mentor" has been accepted!', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
];
// -----------------------------------

const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const panelRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkOne = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAll = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <div
            ref={panelRef}
            className="notifications-wrapper"
        >
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                className={`bell-btn ${isOpen ? 'is-open' : ''}`}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="unread-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="notifications-panel">
                    {/* Header */}
                    <div className="panel-header">
                        <div className="header-title-group">
                            <Bell size={18} className="bell-icon" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="unread-count-pill">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="header-actions">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    title="Mark all as read"
                                    className="mark-all-btn"
                                >
                                    <CheckCheck size={14} /> All read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="close-panel-btn"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <Bell size={36} style={{ opacity: 0.3 }} />
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No notifications yet</p>
                                <p style={{ margin: 0, fontSize: '12px' }}>You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                                >
                                    {/* Icon */}
                                    <div 
                                        className="notif-icon-box"
                                        style={{
                                            background: `${TYPE_COLORS[notif.type] || '#6366f1'}18`,
                                            color: TYPE_COLORS[notif.type] || '#6366f1',
                                        }}
                                    >
                                        {TYPE_ICONS[notif.type] || <Info size={15} />}
                                    </div>
 
                                    {/* Content */}
                                    <div className="notif-content">
                                        <p className={`notif-message ${notif.isRead ? '' : 'is-unread'}`}>
                                            {notif.message}
                                        </p>
                                        <span className="notif-time">
                                            {timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
 
                                    {/* Mark read */}
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => handleMarkOne(notif.id)}
                                            title="Mark as read"
                                            className="mark-read-btn"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
 
                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <div className="unread-dot" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
