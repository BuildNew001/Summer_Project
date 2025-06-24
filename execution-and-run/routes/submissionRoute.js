const express = require('express')
const router = express.Router()
const {
    runCode,
    //todo
    // submitCode,
    // getAllSubmissions,
    // getSubmission,
} = require('../controllers/submitCode');
router.post('/run', runCode);
// router.post('/submit', submitCode);
// router.get('/:id', getSubmission);
// router.get('/', getAllSubmissions);

module.exports = router;
