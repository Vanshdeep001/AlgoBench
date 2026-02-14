const Submission = require('../models/submission');

/**
 * Get user submission heatmap for last 365 days
 * @route GET /user/me/heatmap
 * @access Protected (requires userMiddleware)
 */
const getUserHeatmap = async (req, res) => {
    try {
        const userId = req.result._id;

        // Calculate date 365 days ago
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        oneYearAgo.setHours(0, 0, 0, 0);

        // MongoDB Aggregation Pipeline
        const submissions = await Submission.aggregate([
            {
                $match: {
                    userId: userId,
                    createdAt: { $gte: oneYearAgo }
                }
            },
            {
                $project: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$date',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Build calendar object
        const calendar = {};
        let totalSubmissions = 0;

        submissions.forEach(item => {
            calendar[item._id] = item.count;
            totalSubmissions += item.count;
        });

        // Calculate streaks
        const maxStreak = calculateMaxStreak(calendar);

        res.status(200).json({
            totalSubmissions,
            totalActiveDays: submissions.length,
            maxStreak,
            calendar
        });

    } catch (error) {
        console.error('Error fetching heatmap:', error);
        res.status(500).json({
            message: 'Failed to fetch heatmap data',
            error: error.message
        });
    }
};

/**
 * Calculate maximum streak of consecutive days with submissions
 */
function calculateMaxStreak(calendar) {
    const dates = Object.keys(calendar).sort();
    if (dates.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;

    // Convert strings to Date objects for diff calculation
    // Note: We need to handle potential time zone offsets carefully, 
    // but since keys are YYYY-MM-DD, treating them as UTC strings is safest
    const timestamps = dates.map(d => new Date(d).getTime());

    for (let i = 0; i < timestamps.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            // Difference in days: (curr - prev) / (1000 * 60 * 60 * 24)
            const diffDays = Math.round((timestamps[i] - timestamps[i - 1]) / (86400000));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }
    }

    return Math.max(maxStreak, currentStreak);
}

module.exports = {
    getUserHeatmap
};
