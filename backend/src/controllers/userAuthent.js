const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * REGISTER
 */
const register = async (req, res) => {
    try {
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: "user",
        });

        const token = jwt.sign(
            { _id: user._id, emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        res.status(201).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
            },
            message: "Registered successfully",
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Registration failed",
        });
    }
};

/**
 * LOGIN
 */
const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { _id: user._id, emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
            },
            message: "Login successful",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * LOGOUT
 */
const logout = async (req, res) => {
    try {
        // Check for both cookie names
        const token = req.cookies.token || req.cookies.admin_auth;

        if (!token) {
            return res.status(200).json({ message: "Already logged out" });
        }

        const payload = jwt.decode(token);

        if (payload?.exp) {
            await redisClient.set(`token:${token}`, "blocked");
            await redisClient.expireAt(`token:${token}`, payload.exp);
        }

        // Clear both possible cookie names
        res.cookie("token", null, {
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
        });

        res.cookie("admin_auth", null, {
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(503).json({
            message: "Logout failed",
        });
    }
};

/**
 * ADMIN REGISTER
 */
const adminRegister = async (req, res) => {
    try {
        validate(req.body);

        const { firstName, emailId, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            emailId,
            password: hashedPassword,
            role: role || "admin",
        });

        res.status(201).json({
            message: "Admin registered successfully",
            user: {
                _id: user._id,
                emailId: user.emailId,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Admin registration failed",
        });
    }
};

/**
 * DELETE PROFILE
 */
const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "Profile deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
};
