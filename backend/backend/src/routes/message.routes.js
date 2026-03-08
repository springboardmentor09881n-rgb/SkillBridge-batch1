const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', messageController.sendMessage);
router.get('/', messageController.getMessages);
router.get('/:otherId/:opportunityId', messageController.getConversation);

module.exports = router;
