const mongoose = require('mongoose');
const { Schema } = mongoose;

const contestSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  problems: [{
    type: Schema.Types.ObjectId,
    ref: 'problem',
  }],
  startTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  scoringType: {
    type: String,
    enum: ['leetcode'],
    default: 'leetcode',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
}, { timestamps: true });

contestSchema.index({ startTime: 1 });
contestSchema.index({ isPublished: 1 });

const Contest = mongoose.model('contest', contestSchema);
module.exports = Contest;
