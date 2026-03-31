const express = require('express');
const router = express.Router();

const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware'); // ✅ FIX

router.get('/', protect, messageController.getMessages);

router.get('/:otherId/:opportunityId', protect, messageController.getConversation);

router.post('/', protect, messageController.sendMessage);

module.exports = router;