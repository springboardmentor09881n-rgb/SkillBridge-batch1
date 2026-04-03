const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post("/", chatController.chatWithAI);
router.post("/match", chatController.getMatches);

module.exports = router;