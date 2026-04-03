const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const opportunityService = require('../services/opportunityService');
const applicationService = require('../services/applicationService');
const dashboardService = require('../services/dashboardService');

// ─── NGO DASHBOARD ─────────────────────────────────────────────
// GET /api/ngo/dashboard
router.get('/dashboard', protect, authorize(['ngo']), async (req, res) => {
    try {
        const data = await dashboardService.getNgoDashboardData(req.user.userId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('NGO dashboard error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── NGO OPPORTUNITIES ─────────────────────────────────────────
// GET /api/ngo/opportunities
router.get('/opportunities', protect, authorize(['ngo']), async (req, res) => {
    try {
        const opportunities = await opportunityService.getOpportunities({
            ...req.query,
            ngoId: req.user.userId
        });
        res.status(200).json({ success: true, data: opportunities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/ngo/opportunities
router.post('/opportunities', protect, authorize(['ngo']), async (req, res) => {
    try {
        const oppData = { ...req.body, ngoId: req.user.userId };
        const opportunity = await opportunityService.createOpportunity(oppData);
        res.status(201).json({
            success: true,
            data: opportunity,
            message: 'Opportunity created successfully'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /api/ngo/opportunities/:id
router.put('/opportunities/:id', protect, authorize(['ngo']), async (req, res) => {
    try {
        const opportunity = await opportunityService.updateOpportunity(
            req.params.id,
            req.body,
            req.user.userId
        );
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found or unauthorized' });
        }
        res.status(200).json({ success: true, data: opportunity });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /api/ngo/opportunities/:id
router.delete('/opportunities/:id', protect, authorize(['ngo']), async (req, res) => {
    try {
        const deleted = await opportunityService.deleteOpportunity(req.params.id, req.user.userId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Opportunity not found or unauthorized' });
        }
        res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── NGO APPLICATIONS ──────────────────────────────────────────
// GET /api/ngo/applications
router.get('/applications', protect, authorize(['ngo']), async (req, res) => {
    try {
        const applications = await applicationService.getNgoApplications(req.user.userId);
        res.status(200).json({ success: true, data: applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/ngo/applications/:id/status
router.put('/applications/:id/status', protect, authorize(['ngo']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required' });
        }
        const application = await applicationService.updateApplicationStatus(
            req.user.userId,
            req.params.id,
            status
        );
        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
