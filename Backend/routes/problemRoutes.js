const express = require('express')
const router = express.Router()
const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getFeaturedProblems
} = require('../controllers/problemController')
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkProblemOwnership } = require('../middleware/problemOwnershipMiddleware');

router.post('/', protect, authorize(['admin', 'setter']), createProblem)
router.get('/', getAllProblems)
router.get('/featured', getFeaturedProblems)

router.get('/:id', getProblemById)
router.put('/:id', protect, checkProblemOwnership, updateProblem)
router.delete('/:id', protect, checkProblemOwnership, deleteProblem)

module.exports = router
