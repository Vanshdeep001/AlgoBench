const Submission = require('../models/submission');
const Problem = require('../models/problem');

/**
 * Get user profile stats - solved problems by difficulty
 * Computes stats dynamically from submissions using MongoDB aggregation
 * @route GET /user/me/stats
 * @access Protected (requires userMiddleware)
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.result._id;

        console.log('=== Fetching User Stats ===');
        console.log('User ID:', userId);

        // MongoDB Aggregation Pipeline
        const stats = await Submission.aggregate([
            // Step 1: Match all accepted submissions for this user
            {
                $match: {
                    userId: userId,
                    status: 'accepted'
                }
            },

            // Step 2: Group by problemId to remove duplicates (same problem solved multiple times)
            {
                $group: {
                    _id: '$problemId',
                    firstSolved: { $min: '$createdAt' } // Keep track of when first solved
                }
            },

            // Step 3: Lookup problem details to get difficulty
            {
                $lookup: {
                    from: 'problems', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },

            // Step 4: Unwind the problem details array
            {
                $unwind: {
                    path: '$problemDetails',
                    preserveNullAndEmptyArrays: false // Skip if problem was deleted
                }
            },

            // Step 5: Group by difficulty and count
            {
                $group: {
                    _id: '$problemDetails.difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('Aggregation result:', stats);

        // Format the response
        const formattedStats = {
            totalSolved: 0,
            easy: 0,
            medium: 0,
            hard: 0
        };

        // Map aggregation results to formatted response
        stats.forEach(stat => {
            const difficulty = stat._id; // 'easy', 'medium', or 'hard'
            const count = stat.count;

            formattedStats.totalSolved += count;

            if (difficulty === 'easy') {
                formattedStats.easy = count;
            } else if (difficulty === 'medium') {
                formattedStats.medium = count;
            } else if (difficulty === 'hard') {
                formattedStats.hard = count;
            }
        });

        console.log('Formatted stats:', formattedStats);

        res.status(200).json(formattedStats);

    } catch (error) {
        console.error('=== Error Fetching User Stats ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            message: 'Failed to fetch user stats',
            error: error.message
        });
    }
};

module.exports = {
    getUserStats
};
