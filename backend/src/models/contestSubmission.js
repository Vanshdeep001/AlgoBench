const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSubmissionSchema = new Schema({
  contestAttemptId: {
    type: Schema.Types.ObjectId,
    ref: 'contestAttempt',
    required: true,
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java'],
  },
  verdict: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  runtime: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  errorMessage: { type: String, default: '' },
  testCasesPassed: { type: Number, default: 0 },
  testCasesTotal: { type: Number, default: 0 },
}, { timestamps: true });

contestSubmissionSchema.index({ contestAttemptId: 1, problemId: 1 });

const ContestSubmission = mongoose.model('contestSubmission', contestSubmissionSchema);
module.exports = ContestSubmission;
