const express = require('express');
const userProfileRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getUserStats, updateProfile, getUserSubmissions } = require('../controllers/userProfile');

/**
 * @route   GET /user/me/stats
 * @desc    Get current user's profile stats (solved problems by difficulty)
 * @access  Protected
 */
userProfileRouter.get('/me/stats', userMiddleware, getUserStats);

/**
 * @route   GET /user/me/submissions
 * @desc    Get recent submissions, heatmap and simple insights for current user
 * @access  Protected
 */
userProfileRouter.get('/me/submissions', userMiddleware, getUserSubmissions);

/**
 * @route   PATCH /user/me
 * @desc    Update current user's profile details
 * @access  Protected
 */
userProfileRouter.patch('/me', userMiddleware, updateProfile);

module.exports = userProfileRouter;
