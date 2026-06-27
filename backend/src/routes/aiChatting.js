const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { solveDoubt, checkKeys } = require('../controllers/solveDoubt');

aiRouter.post('/chat', userMiddleware, solveDoubt);

// Development-only endpoint to validate configured AI keys/providers.
// Exposed without auth so you can test keys locally. Only enabled in development.
if (process.env.NODE_ENV === 'development') {
    aiRouter.get('/check-keys', checkKeys);
}

module.exports = aiRouter;