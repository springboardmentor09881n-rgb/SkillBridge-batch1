const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

// GET /api/notifications — get all notifications for logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await notificationService.getNotifications(req.user.userId);
        const unreadCount = await notificationService.getUnreadCount(req.user.userId);
        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', protect, async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user.userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/notifications/:id/read — mark single notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
