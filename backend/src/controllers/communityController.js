const Post = require('../models/post');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const User = require('../models/user');

const REPUTATION_UPVOTE = 2;
const REPUTATION_DOWNVOTE = -1;

/**
 * POST /community/posts - Create post (auth required)
 */
const createPost = async (req, res) => {
    try {
        const { title, content, problemId } = req.body;
        const authorId = req.result._id;

        if (!title || !content || title.trim().length === 0 || content.trim().length === 0) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = await Post.create({
            title: title.trim(),
            content: content.trim(),
            authorId,
            problemId: problemId || null
        });

        const populated = await Post.findById(post._id)
            .populate('authorId', 'firstName lastName')
            .lean();

        res.status(201).json({
            message: 'Post created',
            post: {
                ...populated,
                author: populated.authorId,
                authorId: populated.authorId?._id
            }
        });
    } catch (err) {
        console.error('createPost error:', err);
        res.status(500).json({ message: err.message || 'Failed to create post' });
    }
};

/**
 * GET /community/posts - List posts (optional auth)
 * Query: problemId (optional), sort=newest|top|comments
 */
const listPosts = async (req, res) => {
    try {
        const { problemId, sort = 'newest' } = req.query;

        const filter = {};
        if (problemId) filter.problemId = problemId;

        let sortOption = { createdAt: -1 };
        if (sort === 'top') sortOption = { votes: -1, createdAt: -1 };
        if (sort === 'comments') sortOption = { commentCount: -1, createdAt: -1 };

        const posts = await Post.find(filter)
            .sort(sortOption)
            .populate('authorId', 'firstName lastName reputation')
            .lean();

        const postsWithAuthor = posts.map(p => ({
            ...p,
            author: p.authorId,
            authorId: p.authorId?._id
        }));

        res.json({ posts: postsWithAuthor });
    } catch (err) {
        console.error('listPosts error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch posts' });
    }
};

/**
 * GET /community/posts/:id - Get single post (optional auth)
 */
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'firstName lastName reputation')
            .lean();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({
            post: {
                ...post,
                author: post.authorId,
                authorId: post.authorId?._id
            }
        });
    } catch (err) {
        console.error('getPost error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch post' });
    }
};

/**
 * DELETE /community/posts/:id - Delete post (owner or admin)
 */
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.result._id.toString();
        const isAdmin = req.result.role === 'admin';
        const isOwner = post.authorId.toString() === userId;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not allowed to delete this post' });
        }

        await Comment.deleteMany({ postId: post._id });
        await Vote.deleteMany({ postId: post._id });
        await Post.findByIdAndDelete(post._id);

        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error('deletePost error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete post' });
    }
};

/**
 * POST /community/comments - Add comment (auth required)
 */
const addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const authorId = req.result._id;

        if (!postId || !content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Post ID and content are required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await Comment.create({
            postId,
            authorId,
            content: content.trim()
        });

        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

        const populated = await Comment.findById(comment._id)
            .populate('authorId', 'firstName lastName')
            .lean();

        res.status(201).json({
            message: 'Comment added',
            comment: {
                ...populated,
                author: populated.authorId,
                authorId: populated.authorId?._id
            }
        });
    } catch (err) {
        console.error('addComment error:', err);
        res.status(500).json({ message: err.message || 'Failed to add comment' });
    }
};

/**
 * GET /community/comments/:postId - Get comments for a post
 */
const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ postId })
            .sort({ createdAt: 1 })
            .populate('authorId', 'firstName lastName reputation')
            .lean();

        const commentsWithAuthor = comments.map(c => ({
            ...c,
            author: c.authorId,
            authorId: c.authorId?._id
        }));

        res.json({ comments: commentsWithAuthor });
    } catch (err) {
        console.error('getComments error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch comments' });
    }
};

/**
 * DELETE /community/comments/:id - Delete comment (owner or admin)
 */
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.result._id.toString();
        const isAdmin = req.result.role === 'admin';
        const isOwner = comment.authorId.toString() === userId;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not allowed to delete this comment' });
        }

        await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
        await Comment.findByIdAndDelete(comment._id);

        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error('deleteComment error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete comment' });
    }
};

/**
 * POST /community/vote - Upvote or downvote post (auth required)
 * Body: { postId, value } where value is 1 (up) or -1 (down)
 */
const votePost = async (req, res) => {
    try {
        const { postId, value } = req.body;
        const userId = req.result._id;

        if (!postId || (value !== 1 && value !== -1)) {
            return res.status(400).json({ message: 'postId and value (1 or -1) are required' });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const existing = await Vote.findOne({ userId, postId });

        let delta = value;
        if (existing) {
            delta = value - existing.value;
            existing.value = value;
            await existing.save();
        } else {
            await Vote.create({ userId, postId, value });
        }

        const updated = await Post.findByIdAndUpdate(
            postId,
            { $inc: { votes: delta } },
            { new: true }
        ).lean();

        res.json({
            message: 'Vote updated',
            votes: updated.votes,
            userVote: value
        });
    } catch (err) {
        console.error('votePost error:', err);
        res.status(500).json({ message: err.message || 'Failed to vote' });
    }
};

/**
 * GET /community/vote/:postId - Get current user's vote for a post (auth required)
 */
const getUserVote = async (req, res) => {
    try {
        const userId = req.result._id;
        const vote = await Vote.findOne({ userId, postId: req.params.postId }).lean();
        res.json({ userVote: vote ? vote.value : 0 });
    } catch (err) {
        console.error('getUserVote error:', err);
        res.status(500).json({ message: err.message || 'Failed to get vote' });
    }
};

module.exports = {
    createPost,
    listPosts,
    getPost,
    deletePost,
    addComment,
    getComments,
    deleteComment,
    votePost,
    getUserVote
};
