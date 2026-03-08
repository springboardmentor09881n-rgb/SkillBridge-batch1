const applicationService = require('../services/applicationService');

// POST /api/volunteer/apply
// Body: { opportunityId, message }
const applyForOpportunity = async (req, res) => {
    try {
        const { opportunityId, message } = req.body;
        if (!opportunityId) {
            return res.status(400).json({ success: false, message: 'opportunityId is required' });
        }
        // req.user.userId comes from JWT payload
        const application = await applicationService.applyForOpportunity(
            req.user.userId,
            opportunityId,
            message
        );
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/volunteer/applications
const getVolunteerApplications = async (req, res) => {
    try {
        const applications = await applicationService.getVolunteerApplications(req.user.userId);
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/ngo/applications
const getNgoApplications = async (req, res) => {
    try {
        const applications = await applicationService.getNgoApplications(req.user.userId);
        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/ngo/applications/:id/status
// Body: { status }
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required' });
        }
        const application = await applicationService.updateApplicationStatus(
            req.user.userId,
            id,
            status
        );
        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyForOpportunity,
    getVolunteerApplications,
    getNgoApplications,
    updateApplicationStatus
};
