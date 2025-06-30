const express = require('express')
const router = express.Router()
const {
  runCode,
} = require('../controllers/runController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', protect, runCode);
module.exports = router;
