const Submission = require('../models/submission')
const Problem = require('../models/problems') 
const asyncHandler = require('express-async-handler');

const createSubmission = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {problemId, code, language} = req.body;

    const problemExists = await Problem.findById(problemId);
    if (!problemExists) {
        res.status(404);
        throw new Error('Problem not found');
    }

    const newSubmission = await Submission.create({
        userId,
        problemId,
        code,
        language,
        status: 'Pending'
    });

    res.status(201).json({
        message: 'Submission received and is being processed.',
        submissionId: newSubmission._id,
    });
});

const getSubmissionById = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId)
        .populate('userId', 'UserName email') 
        .populate('problemId', 'title');     

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }
    if (submission.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('User not authorized to view this submission');
    }

    res.status(200).json(submission);
});

const getSubmissionsForUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const submissions = await Submission.find({ userId })
        .sort({ createdAt: -1 })
        .populate('problemId', 'title difficulty');

    res.status(200).json(submissions);
});

module.exports = { createSubmission, getSubmissionById, getSubmissionsForUser };