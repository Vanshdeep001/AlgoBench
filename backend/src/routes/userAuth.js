const express = require('express');

const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, googleLogin } = require('../controllers/userAuthent')
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Register
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        photoURL: req.result.photoURL,
        authProvider: req.result.authProvider,
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
})

// Google Sign-In
authRouter.post('/google-login', verifyFirebaseToken, googleLogin);

module.exports = authRouter;
