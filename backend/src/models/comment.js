const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

commentSchema.index({ postId: 1, createdAt: 1 });

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;
