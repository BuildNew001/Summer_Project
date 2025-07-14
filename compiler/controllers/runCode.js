const { executeCode } = require('../utils/execution');

const runCode = async (req, res, next) => {
    const { language = 'cpp', code, input = '' } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, output: '', error: 'Code body cannot be empty.' });
    }

    try {
        const { output, error } = await executeCode(language, code, input);
        
        console.log(error)
        if (error) {
            return res.status(200).json({ success: false, output: '', error });
        }
        const normalizedOutput = output.replace(/\r\n/g, '\n');
        return res.status(200).json({ success: true, output: normalizedOutput, error: '' });
    } catch (err) {
        console.log("error")
        next(err);
    }
};

module.exports = {
    runCode,
};
