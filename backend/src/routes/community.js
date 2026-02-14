const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const {
    createPost,
    listPosts,
    getPost,
    deletePost,
    addComment,
    getComments,
    deleteComment,
    votePost,
    getUserVote
} = require('../controllers/communityController');

// Posts
router.post('/posts', userMiddleware, createPost);
router.get('/posts', optionalAuth, listPosts);
router.get('/posts/:id', optionalAuth, getPost);
router.delete('/posts/:id', userMiddleware, deletePost);

// Comments
router.post('/comments', userMiddleware, addComment);
router.get('/comments/:postId', optionalAuth, getComments);
router.delete('/comments/:id', userMiddleware, deleteComment);

// Vote
router.post('/vote', userMiddleware, votePost);
router.get('/vote/:postId', userMiddleware, getUserVote);

module.exports = router;
