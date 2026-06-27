const redisClient = require('../config/redis');

// Fixed-window per-user rate limiter on top of the existing Redis client.
// Protects the Judge0 quota from rapid-fire Run/Submit clicks.
// Fails open if Redis is unavailable.
const rateLimiter = ({ action, max, windowSeconds }) => async (req, res, next) => {
    try {
        if (!redisClient.isReady) return next();
        const key = `rl:${action}:${req.result._id}`;
        const count = await redisClient.incr(key);
        if (count === 1) await redisClient.expire(key, windowSeconds);
        if (count > max) {
            return res.status(429).json({
                message: `Too many ${action} requests. Limit is ${max} per ${windowSeconds} seconds — please wait a moment.`
            });
        }
    } catch (err) {
        // fail open: a Redis hiccup should not block executions
    }
    return next();
};

module.exports = rateLimiter;
