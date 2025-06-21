const Problem = require('../models/problems'); 
const User = require('../models/user');
exports.createProblem = async (req, res, next) => {
    try {
        const { title, description, inputFormat, outputFormat, constraints, sampleTestCases, tags, difficulty } = req.body;
        const author = req.user.id;
        const problem = await Problem.create({
            title,
            description,
            inputFormat,
            outputFormat,
            constraints,
            sampleTestCases,
            tags,
            difficulty,
            author
        });
        res.status(201).json({
            success: true,
            data: problem
        });
    } catch (err) {
        if (err.code === 11000) { 
            return res.status(400).json({ success: false, message: 'Problem title already exists.' });
        }
        next(err);
    }
};
exports.getAllProblems = async (req, res, next) => {
    try {
        const problems = await Problem.find().populate('author', 'UserName fullname'); 
        res.status(200).json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (err) {
        next(err);
    }
};
exports.getProblemById = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('author', 'UserName fullname');
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }
        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        if (err.name === 'CastError') {
             return res.status(400).json({ success: false, message: 'Invalid problem ID format' });
        }
        next(err);
    }
};

exports.updateProblem = async (req, res, next) => {
    try {
        let problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }
        if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'User not authorized to update this problem' });
        }
        problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true 
        });
        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        if (err.code === 11000) {
             return res.status(400).json({ success: false, message: 'Problem title may already exist.' });
        }
        next(err);
    }
};

exports.deleteProblem = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }
        if (problem.author.toString() !== req.user.id && req.user.role !== 'admin' ) {
            return res.status(403).json({ success: false, message: 'User not authorized to delete this problem' });
        }        
        await problem.deleteOne();
        res.status(200).json({
            success: true,
            data: {} 
        });
    } catch (err) {
        next(err);
    }
};
