const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

/**
 * Optional auth: attaches req.user if valid token present.
 * Does NOT send 401 if token missing - allows guest read access.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.cookies.admin_auth;
        if (!token) {
            req.user = null;
            return next();
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) {
            req.user = null;
            return next();
        }

        const user = await User.findById(_id);
        if (!user) {
            req.user = null;
            return next();
        }

        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;
