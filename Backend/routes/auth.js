const express = require('express')
const router = express.Router()
const { signup, login } = require('../controllers/authController')
const {
  signupValidationRules,
  loginValidationRules,
  handleValidationErrors,
} = require('../middleware/validationMiddleware')

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
module.exports = router
