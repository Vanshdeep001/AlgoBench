const express = require('express');
const rateLimit = require('express-rate-limit');

const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, googleLogin, githubLogin, subscribe } = require('../controllers/userAuthent')
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Strict rate limiter for auth endpoints — 10 attempts per 15 min per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Register & Login
authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', authLimiter, adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        photoURL: req.result.photoURL,
        authProvider: req.result.authProvider,
        githubUsername: req.result.githubUsername,
        isPremium: req.result.isPremium,
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
})

// Subscribe to Premium
authRouter.post('/subscribe', userMiddleware, subscribe);

// Google Sign-In
authRouter.post('/google-login', verifyFirebaseToken, googleLogin);

// GitHub Sign-In
authRouter.post('/github-login', verifyFirebaseToken, githubLogin);

module.exports = authRouter;
