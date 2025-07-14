const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
  SendMessageCommand,
} = require("@aws-sdk/client-sqs");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { processSubmission } = require("./submitCode");
dotenv.config();

const SQS_JOBS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const SQS_RESULTS_QUEUE_URL = process.env.SQS_RESULTS_QUEUE_URL;

if (!SQS_JOBS_QUEUE_URL) {
  console.error("SQS_QUEUE_URL (for jobs) is not defined. Worker cannot start.");
  process.exit(1);
}
if (!SQS_RESULTS_QUEUE_URL) {
  console.error("SQS_RESULTS_QUEUE_URL (for results) is not defined. Worker cannot start.");
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
  const { submissionId, code, language, testCases } = body;
  if (!submissionId) {
    console.error('Received message without a submissionId. Skipping.');
    await deleteMessageFromQueue(message.ReceiptHandle, SQS_JOBS_QUEUE_URL);
    return;
  }
  console.log(`Processing job for submission: ${submissionId}`);

  let visibilityExtender;
  try {
    visibilityExtender = setInterval(async () => {
      try {
        await sqsClient.send(new ChangeMessageVisibilityCommand({
          QueueUrl: SQS_JOBS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle,
          VisibilityTimeout: 120,
        }));
        console.log(`Visibility extended for submission: ${submissionId}`);
      } catch (extendError) {
        console.error(`Failed to extend visibility for ${submissionId}:`, extendError);
      }
    }, 60000);

    if (!code || !language || !testCases) {
      console.error(`Invalid message format for submission ${submissionId}. Missing code, language, or testCases.`);
      await deleteMessageFromQueue(message.ReceiptHandle, SQS_JOBS_QUEUE_URL);
      return;
    }
    const result = await processSubmission(code, language, testCases);
     const finalOutput = result.verdict === 'Wrong Answer' ? result.error : result.details;
    const finalError = result.verdict === 'Wrong Answer' ? '' : (result.error || '');
    console.log(`Submission ${submissionId} evaluated. Verdict: ${result.verdict}. Sending result to backend...`);
    const resultPayload = {
      submissionId,
       status: result.verdict, 
      output: finalOutput,    
      error: finalError,
    };

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: SQS_RESULTS_QUEUE_URL,
      MessageBody: JSON.stringify(resultPayload),
      MessageGroupId: submissionId,
      MessageDeduplicationId: uuidv4(), 
    });
    await sqsClient.send(sendMessageCommand);
    console.log(`Successfully sent result for submission ${submissionId} to the results queue.`);
    await deleteMessageFromQueue(message.ReceiptHandle, SQS_JOBS_QUEUE_URL);
    console.log(`Job for submission ${submissionId} processed and message deleted.`);

  } catch (processingError) {
   console.error(`Unhandled error processing submission ${submissionId}:`, processingError);
  } finally {
    if (visibilityExtender) {
      clearInterval(visibilityExtender);
    }
  }
};

const deleteMessageFromQueue = async (receiptHandle, queueUrl) => {
  try {
    await sqsClient.send(new DeleteMessageCommand({
      QueueUrl: queueUrl,
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
        QueueUrl: SQS_JOBS_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 120,
      };

      try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));
        if (data.Messages && data.Messages.length > 0) {
          console.log(`Received ${data.Messages.length} messages. Processing in parallel...`);
          const processingPromises = data.Messages.map(message => processMessage(message));
          await Promise.all(processingPromises);
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
