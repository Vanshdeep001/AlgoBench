const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

postSchema.index({ problemId: 1, createdAt: -1 });
postSchema.index({ problemId: 1, votes: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ votes: -1 });
postSchema.index({ commentCount: -1 });

postSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('comment').deleteMany({ postId: doc._id });
        await mongoose.model('vote').deleteMany({ postId: doc._id });
    }
});

const Post = mongoose.model('post', postSchema);
module.exports = Post;
