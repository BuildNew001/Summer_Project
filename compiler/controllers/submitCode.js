const { executeCode } = require('../utils/execution');

const normalize = (text) => {
    if (!text) return '';
    return text
        .replace(/\r\n/g, '\n') 
        .split('\n')             
        .map(line => line.trim()) 
        .join('\n')              
        .trim();                
};

const getVerdictFromError = (errorMessage) => {
    if (errorMessage.startsWith('Compilation Error:')) {
        return 'Compilation Error';
    }
    if (errorMessage.startsWith('Time Limit Exceeded')) {
        return 'Time Limit Exceeded';
    }
    return 'Runtime Error';
};
const processSubmission = async (code, language, testCases = []) => {
    if (testCases.length === 0) {
        return {
            verdict: 'Accepted',
            details: 'No test cases to run against.',
        };
    }

    for (const [index, testCase] of testCases.entries()) {
        const { input, output: expectedOutput } = testCase;
        const { output, error } = await executeCode(language, code, input || '');

        if (error) {
            const verdict = getVerdictFromError(error);
            return {
                verdict,
                details: `Failed on test case ${index + 1}`,
                error: error,
            };
        }

        const normalizedOutput = normalize(output);
        const normalizedExpected = normalize(expectedOutput);

        if (normalizedOutput !== normalizedExpected) {
            return {
                verdict: 'Wrong Answer',
                details: `Failed on test case ${index + 1}`,
                error: `Input:\n${input}\n\nExpected:\n${normalizedExpected}\n\nGot:\n${normalizedOutput}`,
            };
        }
    }
    return {
        verdict: 'Accepted',
        details: 'All test cases passed.',
    };
};

module.exports = {
    processSubmission,
};
