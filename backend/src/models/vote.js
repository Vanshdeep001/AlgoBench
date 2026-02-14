const mongoose = require('mongoose');
const { Schema } = mongoose;

const voteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    value: {
        type: Number,
        required: true,
        enum: [1, -1]
    }
}, {
    timestamps: true
});

voteSchema.index({ userId: 1, postId: 1 }, { unique: true });
voteSchema.index({ postId: 1 });

const Vote = mongoose.model('vote', voteSchema);
module.exports = Vote;
