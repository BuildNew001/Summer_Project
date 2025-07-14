const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const Submission = require('../models/submission');
const dotenv = require('dotenv');

dotenv.config();

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const SQS_RESULTS_QUEUE_URL = process.env.SQS_RESULTS_QUEUE_URL;

if (!SQS_RESULTS_QUEUE_URL) {
    console.error("SQS_RESULTS_QUEUE_URL is not defined. Result consumer cannot start.");
}

let isShuttingDown = false;
function gracefulShutdown() {
  if (isShuttingDown) return;
  console.log('Received shutdown signal for result consumer. Finishing current message and shutting down...');
  isShuttingDown = true;
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const deleteMessageFromResultQueue = async (receiptHandle) => {
    try {
        await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: SQS_RESULTS_QUEUE_URL,
            ReceiptHandle: receiptHandle,
        }));
    } catch (err) {
        console.error("Failed to delete message from results queue:", err);
        throw err;
    }
};

const processResultMessage = async (message, io) => {
    const body = JSON.parse(message.Body);
    const { submissionId, status, output, error } = body;

    if (!submissionId) {
        console.error('Received result message without a submissionId. Deleting message.');
        await deleteMessageFromResultQueue(message.ReceiptHandle);
        return;
    }

    console.log(`Processing result for submission: ${submissionId}`);

    try {
        const submission = await Submission.findByIdAndUpdate(
            submissionId,
            {
                status,
                output,
                error: error || '',
            },
            { new: true } 
        ).lean();

        if (!submission) {
            console.warn(`Submission with ID ${submissionId} not found. The result could not be saved. Deleting message.`);
            await deleteMessageFromResultQueue(message.ReceiptHandle);
            return;
        }

        console.log(`Submission ${submissionId} updated in DB. Status: ${status}`);
        const userId = submission.userId.toString();
        io.to(userId).emit('submission-update', {
            _id: submission._id.toString(),
            status: submission.status,
            problemId: submission.problemId.toString(),
            output: submission.output,
            error: submission.error,
        });
        console.log(`Sent socket notification to user room: ${userId}`);
        await deleteMessageFromResultQueue(message.ReceiptHandle);
        console.log(`Result message for submission ${submissionId} processed and deleted.`);

    } catch (processingError) {
        console.error(`Error processing result for submission ${submissionId}:`, processingError);
    }
};

const startResultPolling = (io) => {
    if (!SQS_RESULTS_QUEUE_URL) {
        console.warn("Cannot start result polling because SQS_RESULTS_QUEUE_URL is not set.");
        return;
    }
    console.log("Result consumer started. Polling for results...");

    const poll = async () => {
        while (!isShuttingDown) {
            const params = {
                QueueUrl: SQS_RESULTS_QUEUE_URL,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 20, 
            };

            try {
                if (isShuttingDown) break;

                const data = await sqsClient.send(new ReceiveMessageCommand(params));
                if (data.Messages && data.Messages.length > 0) {
                    await processResultMessage(data.Messages[0], io);
                }
            } catch (err) {
                if (isShuttingDown) {
                    break;
                }
                console.error("Result queue polling error:", err);
                await new Promise(res => setTimeout(res, 5000)); 
            }
        }
        console.log('Result polling stopped. Consumer is shutting down.');
    };

    poll().catch(err => {
        console.error("Fatal result polling error:", err);
        process.exit(1);
    });
};

module.exports = { startResultPolling };