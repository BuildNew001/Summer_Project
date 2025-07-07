const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} = require("@aws-sdk/client-sqs");
const dotenv = require("dotenv");
const path = require("path");
const Submission = require("../models/submission");
const Problem = require("../models/problem");
const { processSubmission } = require("./submitCode");
dotenv.config();

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
if (!SQS_QUEUE_URL) {
  console.error("SQS_QUEUE_URL is not defined. Worker cannot start.");
  process.exit(1);
}

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

let isShuttingDown = false;
function gracefulShutdown() {
  if (isShuttingDown) return;
  console.log('Received shutdown signal. Finishing current message and shutting down...');
  isShuttingDown = true;
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);  

const processMessage = async (message) => {
  const body = JSON.parse(message.Body);
  const { submissionId, code, language, problemId } = body;
  console.log(`Processing submission: ${submissionId}`);

  let visibilityExtender;
  try {
    visibilityExtender = setInterval(async () => {
      try {
        await sqsClient.send(new ChangeMessageVisibilityCommand({
          QueueUrl: SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
          VisibilityTimeout: 120,
        }));
        console.log(`Visibility extended for submission: ${submissionId}`);
      } catch (extendError) {
        console.error(`Failed to extend visibility for ${submissionId}:`, extendError);
      }
    }, 60000);

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      console.error(`Submission ${submissionId} not found. Deleting message.`);
      await deleteMessageFromQueue(message.ReceiptHandle);
      return;
    }
    if (submission.status !== 'Pending') {
      console.log(`Submission ${submissionId} is already processed. Deleting message.`);
      await deleteMessageFromQueue(message.ReceiptHandle);
      return;
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error(`Problem ${problemId} not found. Marking submission as failed.`);
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Error',
        output: 'Problem not found.',
        error: 'Problem not found.',
      });
      await deleteMessageFromQueue(message.ReceiptHandle);
      return;
    }

    await processSubmission(submissionId, code, language, problemId);
    await deleteMessageFromQueue(message.ReceiptHandle);
    console.log(`Submission ${submissionId} processed successfully.`);

  } catch (processingError) {
   console.error(`Error processing submission ${submissionId}:`, processingError);
    try {
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Error',
        output: 'Internal error during code processing.',
        error: processingError.message || 'Unknown error',
      });
      await deleteMessageFromQueue(message.ReceiptHandle);
    } catch (updateError) {
      console.error(`Failed to update submission ${submissionId} after processing error. Will not delete message, allowing for retry.`, updateError);
    }
  } finally {
    if (visibilityExtender) {
      clearInterval(visibilityExtender);
    }
  }
};

const deleteMessageFromQueue = async (receiptHandle) => {
  try {
    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    }));
  } catch (err) {
    console.error(" Failed to delete message from queue:", err);
  }
};

const startPolling = () => {
  console.log("Worker started. Polling for messages...");

  const poll = async () => {
    while (!isShuttingDown) {
      const params = {
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 120,
      };

      try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        if (data.Messages && data.Messages.length > 0) {
          await processMessage(data.Messages[0]);
        }
      } catch (err) {
        console.error("Polling error:", err);
        await new Promise(res => setTimeout(res, 5000)); 
      }
    }
    console.log('Polling stopped. Worker is shutting down.');
  };

  poll().catch(err => {
    console.error("Fatal polling error:", err);
    process.exit(1);
  });
};

module.exports = { startPolling };
