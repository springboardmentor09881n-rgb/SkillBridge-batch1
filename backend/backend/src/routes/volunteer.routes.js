const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const opportunityService = require('../services/opportunityService');
const applicationService = require('../services/applicationService');
const dashboardService = require('../services/dashboardService');

// ─── VOLUNTEER DASHBOARD ────────────────────────────────────────
// GET /api/volunteer/dashboard
router.get('/dashboard', protect, authorize(['volunteer']), async (req, res) => {
    try {
        const data = await dashboardService.getVolunteerDashboardData(req.user.userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Volunteer dashboard error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── VOLUNTEER BROWSE OPPORTUNITIES ────────────────────────────
// GET /api/volunteer/opportunities?skill=React&location=Remote&status=open
router.get('/opportunities', protect, authorize(['volunteer']), async (req, res) => {
    try {
        const opportunities = await opportunityService.getOpportunities(req.query);
        res.status(200).json({ success: true, data: opportunities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── APPLY FOR OPPORTUNITY ─────────────────────────────────────
// POST /api/volunteer/apply
// Body: { opportunityId, message }
router.post('/apply', protect, authorize(['volunteer']), async (req, res) => {
    try {
        const { opportunityId, message } = req.body;
        if (!opportunityId) {
            return res.status(400).json({ success: false, message: 'opportunityId is required' });
        }
        await applicationService.applyForOpportunity(req.user.userId, opportunityId, message);
        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ─── GET VOLUNTEER'S OWN APPLICATIONS ──────────────────────────
// GET /api/volunteer/applications
router.get('/applications', protect, authorize(['volunteer']), async (req, res) => {
    try {
        const applications = await applicationService.getVolunteerApplications(req.user.userId);
        res.status(200).json({ success: true, data: applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
