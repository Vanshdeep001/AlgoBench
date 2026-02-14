const Submission = require('../models/submission');

/**
 * Get user acceptance rate stats
 * @route GET /user/me/acceptance
 * @access Protected (requires userMiddleware)
 */
const getUserAcceptance = async (req, res) => {
    try {
        const userId = req.result._id;

        const stats = await Submission.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    acceptedSubmissions: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "accepted"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || { totalSubmissions: 0, acceptedSubmissions: 0 };

        const acceptanceRate = result.totalSubmissions > 0
            ? ((result.acceptedSubmissions / result.totalSubmissions) * 100)
            : 0;

        res.status(200).json({
            totalSubmissions: result.totalSubmissions,
            acceptedSubmissions: result.acceptedSubmissions, // Helpful for debugging/display
            acceptanceRate: parseFloat(acceptanceRate.toFixed(2))
        });

    } catch (error) {
        console.error('Error fetching acceptance stats:', error);
        res.status(500).json({
            message: 'Failed to fetch acceptance stats',
            error: error.message
        });
    }
};

module.exports = {
    getUserAcceptance
};
