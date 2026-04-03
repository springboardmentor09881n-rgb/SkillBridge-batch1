const opportunityService = require('../services/opportunityService')

const createOpportunity = async (req, res) => {
    try {
        const oppData = {
            ...req.body,
            ngoId: req.user.userId,
        }
        const opportunity = await opportunityService.createOpportunity(oppData)
        res.status(201).json({ success: true, data: opportunity })
    } catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
}

const getOpportunities = async (req, res) => {
    try {
        const opportunities = await opportunityService.getOpportunities(req.query)
        res.status(200).json({ success: true, data: opportunities })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

const getNgoOpportunities = async (req, res) => {
    try {
        const opportunities = await opportunityService.getOpportunities({
            ...req.query,
            ngoId: req.user.userId
        })
        res.status(200).json({ success: true, data: opportunities })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await opportunityService.getOpportunityById(req.params.id)
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' })
        }
        res.status(200).json({ success: true, data: opportunity })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await opportunityService.updateOpportunity(
            req.params.id,
            req.body,
            req.user.userId,
        )
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found or you are not authorized',
            })
        }
        res.status(200).json({ success: true, data: opportunity })
    } catch (err) {
        res.status(400).json({ success: false, message: err.message })
    }
}

const deleteOpportunity = async (req, res) => {
    try {
        const success = await opportunityService.deleteOpportunity(req.params.id, req.user.userId)
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found or you are not authorized',
            })
        }
        res.status(200).json({ success: true, message: 'Opportunity deleted successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = {
    createOpportunity,
    getOpportunities,
    getNgoOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity,
}
