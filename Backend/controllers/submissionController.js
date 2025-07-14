const Submission = require('../models/submission')
const Problem = require('../models/problems') 
const asyncHandler = require('express-async-handler');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

// Configure AWS SDK v3 client
const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const createSubmission = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {problemId, code, language} = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
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
    const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
    if (!SQS_QUEUE_URL) {
        console.error('SQS_QUEUE_URL is not defined in environment variables. Code execution message will not be sent.');
    } else {
        const messageBody = {
            submissionId: newSubmission._id.toString(), 
            code: code,
            language: language,
            testCases: problem.sampleTestCases, 
        };
        const params = {
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: SQS_QUEUE_URL
        };

        try {
            await sqsClient.send(new SendMessageCommand(params));
            console.log(`Message sent to SQS for submission ${newSubmission._id}`);
        } catch (sqsErr) {
            console.error(`Error sending message to SQS for submission ${newSubmission._id}:`, sqsErr);
            await Submission.findByIdAndDelete(newSubmission._id); 
            throw new Error('Failed to queue submission for processing. Please try again.');
        }
    }

    res.status(201).json({
        message: 'Submission received and is being processed.',
        submissionId: newSubmission._id,
    });
});

const getSubmissionById = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { _id: userId, role } = req.user;

    console.log(`User ${userId} (role: ${role}) is requesting submission ${submissionId}`);

    const query = { _id: submissionId };
    if (role !== 'admin' && role !== 'setter') {
        query.userId = userId;
    }

    const submission = await Submission.findOne(query)
        .populate('userId', 'UserName email')
        .populate('problemId', 'title');

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found or you are not authorized to view it');
    }

    res.status(200).json({ success: true, data: submission });
});

const getSubmissionsForUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    console.log(`Fetching all submissions for user ID: ${userId}`);

    const submissions = await Submission.find({ userId })
        .sort({ createdAt: -1 })
        .populate('problemId', 'title difficulty _id')
        .lean(); 
    const transformedSubmissions = submissions.map(sub => {
        const { problemId, ...rest } = sub;
        return {
            ...rest,
            problem: problemId,
        };
    });

    res.status(200).json({
        success: true,
        count: transformedSubmissions.length,
        data: transformedSubmissions
    });
});

module.exports = { createSubmission, getSubmissionById, getSubmissionsForUser };