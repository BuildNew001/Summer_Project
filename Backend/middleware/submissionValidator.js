const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose'); 
const validateSubmission = [
    body('problemId')
        .notEmpty().withMessage('Problem ID is required.')
        .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid Problem ID format.'),
    body('code')
        .notEmpty().withMessage('Code is required.')
        .isString().withMessage('Code must be a string.'),
    body('language')
        .notEmpty().withMessage('Language is required.')
        .isString().withMessage('Language must be a string.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next(); 
    }
];

module.exports = { validateSubmission };