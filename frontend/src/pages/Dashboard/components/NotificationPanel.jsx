import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Info, UserCheck, FileText, MessageSquare, Volume2 } from 'lucide-react';
import './NotificationPanel.css';

import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/api';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

const TYPE_ICONS = {
    application: <FileText size={15} />,
    status_update: <UserCheck size={15} />,
    message: <MessageSquare size={15} />,
    general: <Info size={15} />,
};

const TYPE_COLORS = {
    application: '#3b82f6',
    status_update: '#10b981',
    message: '#2563eb', // Unified Blue
    general: '#1d4ed8', // Darker Blue
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

const NotificationPanel = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);

    const playNotificationSound = () => {
        try {
            // Using a premium, subtle 'ding' sound suitable for professional dashboards
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {
                console.warn('[Notifications] Audio blocked by browser. Click the Volume icon in the panel to enable:', e.message);
            });
        } catch (err) {
            console.error('Error playing notification sound:', err);
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        const result = await getNotifications();
        if (result.success) {
            setNotifications(result.data || []);
            setUnreadCount(result.unreadCount || 0);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Socket.IO for real-time notifications
        const socket = io('http://localhost:5000');
        if (user?.id) {
            socket.emit('join', user.id);
        }

        socket.on('newNotification', (notif) => {
            console.log('New real-time notification received:', notif);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Play notification sound
            playNotificationSound();
        });

        return () => socket.disconnect();
    }, [user?.id]);

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

    const handleMarkOne = async (id) => {
        const result = await markNotificationRead(id);
        if (result.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAll = async () => {
        const result = await markAllNotificationsRead();
        if (result.success) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
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
                            <button
                                onClick={playNotificationSound}
                                className="test-sound-btn"
                                title="Test Notification Sound (and allow browser audio)"
                            >
                                <Volume2 size={16} />
                            </button>
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
