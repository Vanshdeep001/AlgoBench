const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === 'production';

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
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
            maxAge: 60 * 60 * 1000,
        });

        res.status(201).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
                isPremium: user.isPremium,
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

        // If user signed up with Google, tell them to use Google Sign-In
        if (user.authProvider === 'google') {
            return res.status(400).json({ message: "This account uses Google Sign-In. Please use the Google button to login." });
        }

        // If user signed up with GitHub, tell them to use GitHub Sign-In
        if (user.authProvider === 'github') {
            return res.status(400).json({ message: "This account uses GitHub Sign-In. Please use the GitHub button to login." });
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
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
                isPremium: user.isPremium,
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
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
        });

        res.cookie("admin_auth", null, {
            expires: new Date(0),
            httpOnly: true,
            sameSite: isProduction ? "strict" : "lax",
            secure: isProduction,
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

/**
 * GOOGLE LOGIN
 *
 * Create-or-update flow:
 * 1. Firebase token is already verified by firebaseAuth middleware
 * 2. Look up user by firebaseUid
 * 3. If not found, look up by email (handles linking existing accounts)
 * 4. If still not found, create a new user
 * 5. Issue a JWT cookie (same as regular login)
 */
const googleLogin = async (req, res) => {
    try {
        const { uid, email, name, picture } = req.firebaseUser;

        // Step 1: Try to find user by Firebase UID (returning Google user)
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Step 2: Check if a user with this email already exists
            // (they registered with email/password before)
            user = await User.findOne({ emailId: email });

            if (user) {
                // Link existing account with Google
                user.firebaseUid = uid;
                user.photoURL = picture || user.photoURL;
                user.lastLogin = new Date();
                await user.save();
            } else {
                // Step 3: Create a brand new user (first-time Google Sign-In)
                user = await User.create({
                    firstName: name?.split(' ')[0] || 'User',
                    lastName: name?.split(' ').slice(1).join(' ') || undefined,
                    emailId: email,
                    authProvider: 'google',
                    firebaseUid: uid,
                    photoURL: picture,
                    role: 'user',
                    lastLogin: new Date(),
                });
            }
        } else {
            // Returning Google user — update last login and profile photo
            user.lastLogin = new Date();
            user.photoURL = picture || user.photoURL;
            if (name) {
                user.firstName = name.split(' ')[0] || user.firstName;
            }
            await user.save();
        }

        // Step 4: Issue YOUR JWT (same as regular login)
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: isProduction ? 'strict' : 'lax',
            secure: isProduction,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
                photoURL: user.photoURL,
                authProvider: user.authProvider,
                isPremium: user.isPremium,
            },
            message: 'Google login successful',
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({
            message: err.message || 'Google authentication failed',
        });
    }
};

/**
 * GITHUB LOGIN
 *
 * Create-or-update flow (mirrors Google login):
 * 1. Firebase token is already verified by firebaseAuth middleware
 * 2. Look up user by firebaseUid
 * 3. If not found, look up by email (handles linking existing accounts)
 * 4. If still not found, create a new user
 * 5. Issue a JWT cookie (same as regular login)
 *
 * GitHub-specific handling:
 * - GitHub username is sent from the frontend (from additionalUserInfo)
 * - GitHub users may have no public email (we use a fallback)
 * - GitHub users may have no displayName (we fall back to username)
 */
const githubLogin = async (req, res) => {
    try {
        const { uid, email, name, picture } = req.firebaseUser;
        const { githubUsername } = req.body;

        // Handle GitHub users with no public email
        const userEmail = email || `${uid}@github.noreply.com`;

        // Handle missing displayName — fall back to GitHub username, truncate to fit schema
        const displayName = name || githubUsername || 'User';
        const firstName = (displayName.split(' ')[0] || 'User').substring(0, 20);

        // Step 1: Try to find user by Firebase UID (returning GitHub user)
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Step 2: Check if a user with this email already exists
            // (they registered with email/password or Google before)
            user = await User.findOne({ emailId: userEmail });

            if (user) {
                // Link existing account with GitHub
                user.firebaseUid = uid;
                user.photoURL = picture || user.photoURL;
                user.githubUsername = githubUsername || user.githubUsername;
                user.lastLogin = new Date();
                await user.save();
            } else {
                // Step 3: Create a brand new user (first-time GitHub Sign-In)
                user = await User.create({
                    firstName: firstName,
                    lastName: displayName.split(' ').slice(1).join(' ').substring(0, 20) || undefined,
                    emailId: userEmail,
                    authProvider: 'github',
                    firebaseUid: uid,
                    photoURL: picture,
                    githubUsername: githubUsername || null,
                    role: 'user',
                    lastLogin: new Date(),
                });
            }
        } else {
            // Returning GitHub user — update last login and profile info
            user.lastLogin = new Date();
            user.photoURL = picture || user.photoURL;
            user.githubUsername = githubUsername || user.githubUsername;
            if (displayName && displayName !== 'User') {
                user.firstName = firstName;
            }
            await user.save();
        }

        // Step 4: Issue YOUR JWT (same as regular login)
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: isProduction ? 'strict' : 'lax',
            secure: isProduction,
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
                photoURL: user.photoURL,
                authProvider: user.authProvider,
                githubUsername: user.githubUsername,
                isPremium: user.isPremium,
            },
            message: 'GitHub login successful',
        });
    } catch (err) {
        console.error('GitHub login error:', err);
        res.status(500).json({
            message: err.message || 'GitHub authentication failed',
        });
    }
};

/**
 * SUBSCRIBE
 */
const subscribe = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findByIdAndUpdate(
            userId,
            { isPremium: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role,
                photoURL: user.photoURL,
                authProvider: user.authProvider,
                githubUsername: user.githubUsername,
                isPremium: user.isPremium,
            },
            message: "Subscribed successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Subscription failed",
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile,
    googleLogin,
    githubLogin,
    subscribe,
};
