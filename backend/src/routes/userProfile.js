const express = require('express');
const userProfileRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getUserStats } = require('../controllers/userProfile');

/**
 * @route   GET /user/me/stats
 * @desc    Get current user's profile stats (solved problems by difficulty)
 * @access  Protected
 */
userProfileRouter.get('/me/stats', userMiddleware, getUserStats);

module.exports = userProfileRouter;
