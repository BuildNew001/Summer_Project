const dotenv = require('dotenv');
const { executeCode } = require('../utils/execution');
const runCode = async (req, res, next) => {
    const { language = 'cpp', code, input = '' } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Code body cannot be empty.' });
    }

    try {
        const { output, error } = await executeCode(language, code, input);
         const normalizedOutput = output.replace(/\r\n/g, '\n');
        if (error) {
            return res.status(200).json({ success: true, output: error });
        }
        res.status(200).json({ success: true, normalizedOutput });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    runCode,
};

