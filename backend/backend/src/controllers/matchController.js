const matchService = require('../services/matchService');

// ======================================
// 🤝 GET MATCH SUGGESTIONS
// ======================================
exports.getMatches = async (req, res) => {
    try {
        const userId = req.user.userId;

        const data = await matchService.getMatches(userId);

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Match Fetch Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch matches'
        });
    }
};

// ======================================
// 📌 RECORD INTERACTION (APPLY / IGNORE)
// ======================================
exports.recordInteraction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { opportunityId, action } = req.body;

        if (!opportunityId || !action) {
            return res.status(400).json({
                success: false,
                message: 'Missing fields'
            });
        }

        await matchService.recordInteraction(
            userId,
            parseInt(opportunityId),
            action
        );

        return res.json({
            success: true
        });
    } catch (error) {
        console.error('Match Interaction Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to record interaction'
        });
    }
};