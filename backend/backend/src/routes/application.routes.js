const express = require('express');
const router = express.Router();
const {
    applyForOpportunity,
    getVolunteerApplications,
    getNgoApplications,
    updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Volunteer routes
router.post('/volunteer/apply', protect, authorize(['volunteer']), applyForOpportunity);
router.get('/volunteer/applications', protect, authorize(['volunteer']), getVolunteerApplications);

// NGO routes
router.get('/ngo/applications', protect, authorize(['ngo']), getNgoApplications);
router.put('/ngo/applications/:id/status', protect, authorize(['ngo']), updateApplicationStatus);

module.exports = router;
