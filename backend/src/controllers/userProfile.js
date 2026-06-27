const Submission = require('../models/submission');
const User = require('../models/user');
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

        // MongoDB Aggregation Pipeline
        const stats = await Submission.aggregate([
            {
                $match: {
                    userId: userId,
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: '$problemId',
                    firstSolved: { $min: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemDetails'
                }
            },
            {
                $unwind: {
                    path: '$problemDetails',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: '$problemDetails.difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            totalSolved: 0,
            easy: 0,
            medium: 0,
            hard: 0
        };

        stats.forEach(stat => {
            const difficulty = stat._id;
            const count = stat.count;
            formattedStats.totalSolved += count;
            if (difficulty === 'easy') formattedStats.easy = count;
            else if (difficulty === 'medium') formattedStats.medium = count;
            else if (difficulty === 'hard') formattedStats.hard = count;
        });

        res.status(200).json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user stats', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { firstName, lastName, age, githubUsername } = req.body;
        const updates = {};
        if (firstName) {
            if (firstName.length < 3 || firstName.length > 20) return res.status(400).json({ message: "First name duration error" });
            updates.firstName = firstName;
        }
        if (lastName) {
            if (lastName.length < 3 || lastName.length > 20) return res.status(400).json({ message: "Last name duration error" });
            updates.lastName = lastName;
        }
        if (age) {
            if (age < 6 || age > 80) return res.status(400).json({ message: "Age range error" });
            updates.age = age;
        }
        if (githubUsername !== undefined) {
            updates.githubUsername = githubUsername;
        }
        if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid fields" });

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Profile updated successfully",
            user: { 
                firstName: user.firstName, 
                lastName: user.lastName, 
                emailId: user.emailId, 
                age: user.age, 
                role: user.role, 
                githubUsername: user.githubUsername,
                _id: user._id 
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};

/**
 * Get recent submissions and derived heatmap/insights for the current user
 * @route GET /user/me/submissions
 * @access Protected
 */
const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.result._id;

        // Fetch recent submissions (most recent first)
        const subs = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(200).populate({
            path: 'problemId',
            select: 'title difficulty'
        }).lean();

        // Map to frontend-friendly shape
        const submissions = subs.map(s => ({
            id: s._id,
            title: s.problemId?.title || 'Unknown Problem',
            difficulty: s.problemId?.difficulty || 'unknown',
            status: s.status,
            language: s.language,
            runtime: s.runtime || 0,
            memory: s.memory || 0,
            testCasesPassed: s.testCasesPassed || 0,
            testCasesTotal: s.testCasesTotal || 0,
            timestamp: s.createdAt
        }));

        // Build heatmap calendar counts (YYYY-MM-DD)
        const calendar = {};
        submissions.forEach(s => {
            const dateStr = new Date(s.timestamp).toISOString().split('T')[0];
            calendar[dateStr] = (calendar[dateStr] || 0) + 1;
        });

        const totalSubmissions = submissions.length;
        const totalActiveDays = Object.keys(calendar).length;
        // Compute max streak (consecutive days with activity) within found dates
        const dates = Object.keys(calendar).sort();
        let maxStreak = 0;
        let currentStreak = 0;
        let prev = null;
        dates.forEach(d => {
            const cur = new Date(d);
            if (prev) {
                const diffDays = Math.floor((cur - prev) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak += 1;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            if (currentStreak > maxStreak) maxStreak = currentStreak;
            prev = cur;
        });

        // Simple insights derived from submissions
        const difficultyCount = { easy: 0, medium: 0, hard: 0, unknown: 0 };
        const languageCount = {};
        submissions.forEach(s => {
            if (difficultyCount[s.difficulty] !== undefined) difficultyCount[s.difficulty] += 1;
            else difficultyCount.unknown += 1;
            languageCount[s.language] = (languageCount[s.language] || 0) + 1;
        });

        const mostSolvedCategory = Object.entries(difficultyCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        res.status(200).json({
            submissions,
            heatmap: {
                totalSubmissions,
                totalActiveDays,
                maxStreak,
                calendar
            },
            insights: {
                mostSolvedCategory,
                languageCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

module.exports = {
    getUserStats,
    updateProfile
    , getUserSubmissions
};
