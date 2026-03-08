import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Info, UserCheck, FileText } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../services/api';

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

const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const panelRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        const result = await getNotifications();
        if (result.success) {
            setNotifications(result.data || []);
            setUnreadCount(result.unreadCount || 0);
        }
    }, []);

    // Poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

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
        if (!isOpen) fetchNotifications();
    };

    const handleMarkOne = async (id) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAll = async () => {
        setIsLoading(true);
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        setIsLoading(false);
    };

    return (
        <div
            ref={panelRef}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
        >
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                style={{
                    position: 'relative',
                    background: isOpen ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'inherit',
                    transition: 'background 0.2s',
                }}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: '700',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        lineHeight: 1,
                        boxShadow: '0 0 0 2px white',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '360px',
                    maxHeight: '480px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    zIndex: 9999,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px 12px',
                        borderBottom: '1px solid #f1f5f9',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={18} style={{ color: '#6366f1' }} />
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: '#ede9fe', color: '#6366f1',
                                    borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                                    padding: '1px 8px',
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    disabled={isLoading}
                                    title="Mark all as read"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#6366f1', borderRadius: '8px', padding: '4px 8px',
                                        fontSize: '12px', fontWeight: '600', display: 'flex',
                                        alignItems: 'center', gap: '4px',
                                        opacity: isLoading ? 0.5 : 1,
                                    }}
                                >
                                    <CheckCheck size={14} /> All read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#94a3b8', borderRadius: '8px', padding: '4px',
                                    display: 'flex', alignItems: 'center',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '40px 20px', color: '#94a3b8',
                                gap: '8px',
                            }}>
                                <Bell size={36} style={{ opacity: 0.3 }} />
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No notifications yet</p>
                                <p style={{ margin: 0, fontSize: '12px' }}>You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px 18px',
                                        borderBottom: '1px solid #f8fafc',
                                        background: notif.isRead ? 'white' : '#f8f7ff',
                                        transition: 'background 0.2s',
                                        cursor: 'default',
                                    }}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                        background: `${TYPE_COLORS[notif.type] || '#6366f1'}18`,
                                        color: TYPE_COLORS[notif.type] || '#6366f1',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginTop: '2px',
                                    }}>
                                        {TYPE_ICONS[notif.type] || <Info size={15} />}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: 0, fontSize: '13px', color: '#1e293b',
                                            lineHeight: '1.45', fontWeight: notif.isRead ? '400' : '500',
                                        }}>
                                            {notif.message}
                                        </p>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                                            {timeAgo(notif.createdAt)}
                                        </span>
                                    </div>

                                    {/* Mark read */}
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => handleMarkOne(notif.id)}
                                            title="Mark as read"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: '#6366f1', padding: '2px', flexShrink: 0,
                                                marginTop: '2px', borderRadius: '4px',
                                                display: 'flex', alignItems: 'center',
                                            }}
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}

                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <div style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: '#6366f1', flexShrink: 0, marginTop: '6px',
                                        }} />
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
