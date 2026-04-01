const express = require('express');
const router = express.Router();
const { getVolunteerDashboardData, getNgoDashboardData } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/volunteer/dashboard', protect, authorize(['volunteer']), getVolunteerDashboardData);
router.get('/ngo/dashboard', protect, authorize(['ngo']), getNgoDashboardData);

module.exports = router;
