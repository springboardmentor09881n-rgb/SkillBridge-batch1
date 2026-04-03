const messageService = require('../services/messageService');
const notificationService = require('../services/notificationService');
const pool = require('../config/db');

/**
 * Get all conversations for the authenticated user
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await messageService.getConversations(userId);
        res.status(200).json({ success: true, data: conversations });
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ success: false, message: 'Internal server error while fetching conversations' });
    }
};

/**
 * Get messages between the authenticated user and another user
 */
const getConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherId } = req.params;
        const { opportunityId } = req.query;

        if (!otherId) {
            return res.status(400).json({ success: false, message: 'otherId is required' });
        }

        const messages = await messageService.getMessagesBetween(userId, otherId, opportunityId);
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error('Error fetching messages history:', err);
        res.status(500).json({ success: false, message: 'Internal server error while fetching messages' });
    }
};

/**
 * Standard HTTP POST for saving messages (Socket.IO handles most real-time but some prefer HTTP)
 */
const saveMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const { receiverId, content, opportunityId } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ success: false, message: 'receiverId and content are required' });
        }

        const messageData = { senderId, receiverId, content, opportunityId };
        const savedMessage = await messageService.saveMessage(messageData);
        
        // NOTIFY: Create a notification for the receiver (same as in socket logic)
        try {
            const senderRes = await pool.query('SELECT "fullName", "organizationName" FROM users WHERE id = $1', [senderId]);
            const sender = senderRes.rows[0];
            const senderName = sender?.fullName || sender?.organizationName || 'Someone';

            await notificationService.createNotification(
                receiverId,
                'message',
                `New message from ${senderName}: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
                senderId
            );
        } catch (notifErr) {
            console.error('Notification error in HTTP message:', notifErr.message);
        }

        res.status(201).json({ success: true, data: savedMessage });
    } catch (err) {
        console.error('Error saving message via HTTP:', err);
        res.status(500).json({ success: false, message: 'Internal server error while saving message' });
    }
};

/**
 * Mark a conversation as read
 */
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherId } = req.params;

        if (!otherId) {
            return res.status(400).json({ success: false, message: 'otherId is required' });
        }

        await messageService.markConversationAsRead(userId, otherId);
        res.status(200).json({ success: true, message: 'Conversation marked as read' });
    } catch (err) {
        console.error('Error marking conversation as read:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getConversations,
    getConversation,
    saveMessage,
    markAsRead
};
