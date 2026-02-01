const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getUserAcceptance } = require('../controllers/userAcceptance');

router.get('/me/acceptance', userMiddleware, getUserAcceptance);

module.exports = router;
