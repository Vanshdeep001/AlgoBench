const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getUserHeatmap } = require('../controllers/userHeatmap');

router.get('/me/heatmap', userMiddleware, getUserHeatmap);

module.exports = router;
