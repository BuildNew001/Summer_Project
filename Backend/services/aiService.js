const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const aiService = async (code, description) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You will be given a problem description and a code snippet.
Your task is to:
1. Provide one test case (input and expected output) where the code gives a wrong or unexpected output.
2. Briefly explain whether the approach used in the code is correct or incorrect, and why.
3.Also tell where is the mistake breifly pointout the code part where the mistake is.

Keep your answer short and clear (10-11 lines).
Do not suggest the correct code or fix.

Problem Description:
${description}

Code:
${code}
`.trim();

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  return text;
};

module.exports = {
  aiService,
};
