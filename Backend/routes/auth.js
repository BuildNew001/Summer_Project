const express = require('express')
const router = express.Router()
const { signup, login, logout, getMe } = require('../controllers/authController')
const {
  signupValidationRules,
  loginValidationRules,
  handleValidationErrors,
} = require('../middleware/validationMiddleware')
const { protect } = require('../middleware/authMiddleware')

router.post(
  '/signup',
  signupValidationRules(),
  handleValidationErrors,
  signup
)

router.post(
  '/login',
  loginValidationRules(),
  handleValidationErrors,
  login
)

router.post('/logout', logout);

router.get('/me', protect, getMe);
module.exports = router
