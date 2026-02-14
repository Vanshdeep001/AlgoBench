const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestAttemptSchema = new Schema({
  contestId: {
    type: Schema.Types.ObjectId,
    ref: 'contest',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['running', 'submitted', 'expired'],
    default: 'running',
  },
}, { timestamps: true });

contestAttemptSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestAttemptSchema.index({ contestId: 1, score: -1, endTime: 1 });

const ContestAttempt = mongoose.model('contestAttempt', contestAttemptSchema);
module.exports = ContestAttempt;
