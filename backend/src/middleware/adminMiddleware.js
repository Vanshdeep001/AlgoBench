const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req, res, next) => {

    try {

        // Check for 'token' cookie first, then fallback to 'admin_auth'
        const token = req.cookies.token || req.cookies.admin_auth;
        if (!token)
            throw new Error("Token is not persent");

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const { _id } = payload;

        if (!_id) {
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if (payload.role != 'admin')
            throw new Error("Invalid Token");

        if (!result) {
            throw new Error("User Doesn't Exist");
        }

        // Redis blocklist check (skip if Redis unavailable so server doesn't crash)
        let isBlocked = false;
        try {
            isBlocked = await redisClient.exists(`token:${token}`);
        } catch (redisErr) {
            console.warn('Redis blocklist check skipped:', redisErr.message);
        }
        if (isBlocked)
            throw new Error("Invalid Token");

        req.result = result;


        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }

}


module.exports = adminMiddleware;
