const dashboardService = require('../services/dashboardService');

// GET /api/volunteer/dashboard
const getVolunteerDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getVolunteerDashboardData(req.user.userId);
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        console.error('Volunteer dashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/ngo/dashboard
const getNgoDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getNgoDashboardData(req.user.userId);
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        console.error('NGO dashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getVolunteerDashboard,
    getNgoDashboard
};
