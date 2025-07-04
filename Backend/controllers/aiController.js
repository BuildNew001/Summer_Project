const asyncHandler = require('express-async-handler');
const { aiService } = require('../services/aiService');
const Problem = require('../models/problems');

const generateReview = asyncHandler(async (req, res) => {
  const { code, problemId } = req.body;

  if (!code || !problemId) {
    res.status(400);
    throw new Error('Please provide both code and a problemId for review.');
  }

  const problem = await Problem.findById(problemId).lean();
  if (!problem) {
    res.status(404);
    throw new Error('Problem not found');
  }
  const description = problem.description?.trim();
  const review = await aiService(code,description);

  res.status(200).json({
    success: true,
    review: review,
  });
});

module.exports = {
  generateReview,
};