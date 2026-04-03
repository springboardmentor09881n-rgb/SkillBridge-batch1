const express = require('express')
const router = express.Router()
const {
    createOpportunity,
    getOpportunities,
    getNgoOpportunities,
    getOpportunityById,
    updateOpportunity,
    deleteOpportunity,
} = require('../controllers/opportunityController')
const { protect, authorize } = require('../middleware/authMiddleware')

// IMPORTANT: /my/all must come BEFORE /:id to avoid route shadowing
router.get('/my/all', protect, authorize(['ngo']), getNgoOpportunities)

// Public routes
router.get('/', getOpportunities)
router.get('/:id', getOpportunityById)

// Protected routes (NGO only)
router.post('/', protect, authorize(['ngo']), createOpportunity)
router.put('/:id', protect, authorize(['ngo']), updateOpportunity)
router.delete('/:id', protect, authorize(['ngo']), deleteOpportunity)

module.exports = router
