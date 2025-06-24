const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose'); 
const validateSubmission = [
    // Check if problemId is present and a valid MongoDB ObjectId format
    body('problemId')
        .notEmpty().withMessage('Problem ID is required.')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Problem ID format.'),
    // Check if code is present and a string
    body('code')
        .notEmpty().withMessage('Code is required.')
        .isString().withMessage('Code must be a string.'),
    // Check if language is present and a string
    body('language')
        .notEmpty().withMessage('Language is required.')
        .isString().withMessage('Language must be a string.'),

    // Middleware to handle validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); // Proceed to the next middleware/controller if validation passes
    }
];

module.exports = { validateSubmission };