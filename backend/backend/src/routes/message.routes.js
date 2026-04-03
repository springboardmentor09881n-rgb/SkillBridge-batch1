const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

/**
 * GET /api/messages
 * Get the list of all conversations for the logged-in user
 */
router.get('/', protect, messageController.getConversations);

/**
 * GET /api/messages/:otherId
 * Get message history for a specific conversation
 */
router.get('/:otherId', protect, messageController.getConversation);

router.post('/', protect, messageController.saveMessage);

/**
 * PUT /api/messages/:otherId/read
 * Mark a conversation as read
 */
router.put('/:otherId/read', protect, messageController.markAsRead);

module.exports = router;
