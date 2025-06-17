const { body, validationResult } = require('express-validator')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

const signupValidationRules = () => {
  return [
    body('fullname').trim().notEmpty().withMessage('Fullname is required.').escape(),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('UserName').trim().notEmpty().withMessage('Username is required.').escape(),
    body('dob').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid date of birth format.'),
    body('role').optional({ checkFalsy: true }).isIn(['admin', 'user','setter']).withMessage('Invalid role value.'),
  ]
}

const loginValidationRules = () => {
  return [
    body('emailOrUsername').trim().notEmpty().withMessage('Email or Username is required.').escape(),
    body('password').notEmpty().withMessage('Password is required.'),
  ]
}

module.exports = {
  handleValidationErrors,
  signupValidationRules,
  loginValidationRules,
}