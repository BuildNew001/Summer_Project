const express = require('express');
const router = express.Router();
const { 
    createSubmission, 
    getSubmissionById, 
    getSubmissionsForUser 
} = require('../controllers/submissionController');
const { validateSubmission } = require('../middleware/submissionValidator');
const { protect } = require('../middleware/authMiddleware'); 
router.post('/', protect, validateSubmission, createSubmission);
router.get('/:submissionId', protect, getSubmissionById);
router.get('/', protect, getSubmissionsForUser);

module.exports = router;