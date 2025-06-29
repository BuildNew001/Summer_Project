const Submission = require('../models/submission');
const Problem = require('../models/problem');
const { executeCode } = require('../utils/execution');
const processSubmission = async (submissionId, code, language, problemId) => {
    const problem = await Problem.findById(problemId);
    let allPassed = true;
    let verdict = '';
    let finalOutput = '';

    for (const testCase of problem.sampleTestCases) {
        const { input, expectedOutput } = testCase;
        const { output, error } = await executeCode(language, code, input || '');
        if (error) {
            allPassed = false;
            verdict = 'Runtime Error';
            finalOutput = error;
            break; 
        }
        const normalizedOutput = output.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = (expectedOutput || '').trim().replace(/\r\n/g, '\n');
        if (normalizedOutput !== normalizedExpected) {
            allPassed = false;
            verdict = 'Wrong Answer';
            finalOutput = `Input:\n${input}\n\nExpected:\n${normalizedExpected}\n\nGot:\n${normalizedOutput}`;
            break; 
        }
    }

    if (allPassed) {
        verdict = 'Accepted';
        finalOutput = 'All test cases passed.';
    }
    await Submission.findByIdAndUpdate(submissionId, {
        status: verdict,
        output: finalOutput,
        error: verdict === 'Runtime Error' ? finalOutput : '',
    });

    console.log(`Submission ${submissionId} evaluated with verdict: ${verdict}`);
};

module.exports = {
    processSubmission,
};
