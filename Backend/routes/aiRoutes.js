const express = require('express')
const router = express.Router()
const {
  generateReview,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', generateReview);
module.exports = router;
