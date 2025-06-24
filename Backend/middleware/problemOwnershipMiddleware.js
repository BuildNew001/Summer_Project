const asyncHandler = require('express-async-handler')
const Problem = require('../models/problems')
const checkProblemOwnership = asyncHandler(async (req, res, next) => {
  const problem = await Problem.findById(req.params.id)

  if (!problem) {
    res.status(404)
    throw new Error('Problem not found')
  }
  const user = req.user
  if (problem.author && problem.author.toString() === user.id && user.role === 'admin') {
    return next()
  }

  res.status(403)
  throw new Error('User not authorized to perform this action')
})

module.exports = { checkProblemOwnership }
