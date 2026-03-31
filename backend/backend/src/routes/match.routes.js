const express = require('express');
const router = express.Router();

const matchController = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware'); // ✅ FIX

router.get('/suggestions', protect, matchController.getMatches);

router.post('/interact', protect, matchController.recordInteraction);

module.exports = router;