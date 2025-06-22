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
const { protect, authorize } = require('../middleware/authMiddleware')

router.post('/', protect, authorize(['admin', 'setter']), createProblem)
router.get('/', getAllProblems)
router.get('/featured', getFeaturedProblems)

router.get('/:id', getProblemById)
router.put('/:id', protect, authorize(['admin', 'setter']), updateProblem)
router.delete('/:id', protect, authorize(['admin', 'setter']), deleteProblem)

module.exports = router
