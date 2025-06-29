const mongoose = require('mongoose')

const SUBMISSION_STATUSES = [
  'Pending',
  'Accepted',
  'Wrong Answer',
  'Runtime Error',
  'Time Limit Exceeded',
  'Compilation Error',
  'Internal Error' 
]
const SubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    code: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'Pending',
      enum: SUBMISSION_STATUSES
    },
    output: {
      type: String
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Submission', SubmissionSchema)

