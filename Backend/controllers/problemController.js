const Problem = require('../models/problems'); 
const asyncHandler = require('express-async-handler');

exports.createProblem = asyncHandler(async (req, res) => {
    const { title, description, inputFormat, outputFormat, constraints, sampleTestCases, tags, difficulty } = req.body;
    const author = req.user.id;

    const problemExists = await Problem.findOne({ title });
    if (problemExists) {
        res.status(400);
        throw new Error('Problem with this title already exists.');
    }

    const problem = await Problem.create({
        title, description, inputFormat, outputFormat, constraints, sampleTestCases, tags, difficulty, author
    });

    res.status(201).json({
        success: true,
        data: problem
    });
});

exports.getAllProblems = asyncHandler(async (req, res) => {
    const problems = await Problem.find().populate('author', 'UserName fullname'); 
    res.status(200).json({
        success: true,
        count: problems.length,
        data: problems
    });
});

exports.getProblemById = asyncHandler(async (req, res) => {
    const problem = await Problem.findById(req.params.id).populate('author', 'UserName fullname');
    if (!problem) {
        res.status(404);
        throw new Error('Problem not found');
    }
    res.status(200).json({
        success: true,
        data: problem
    });
});

exports.updateProblem = asyncHandler(async (req, res) => {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!problem) {
        res.status(404);
        throw new Error('Problem not found');
    }

    res.status(200).json({
        success: true,
        data: problem
    });
});

exports.deleteProblem = asyncHandler(async (req, res) => {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
        res.status(404);
        throw new Error('Problem not found');
    }
    res.status(200).json({ success: true, data: {} });
});

exports.getFeaturedProblems = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 3;
    const problems = await Problem.find({ isFeatured: true })
        .sort({ createdAt: -1 }) 
        .populate('author', 'UserName fullname')
        .limit(limit);

    res.status(200).json({
        success: true,
        count: problems.length,
        data: problems
    });
});
