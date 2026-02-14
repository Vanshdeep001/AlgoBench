const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
  getContests,
  getContestById,
  startAttempt,
  getMyAttempt,
  submitSolution,
  runCode,
  getLeaderboard,
} = require('../controllers/contestController');

router.get('/', userMiddleware, getContests);
router.post('/submit', userMiddleware, submitSolution);
router.post('/run', userMiddleware, runCode);
router.get('/:contestId', userMiddleware, getContestById);
router.post('/:contestId/start', userMiddleware, startAttempt);
router.get('/:contestId/attempt', userMiddleware, getMyAttempt);
router.get('/:contestId/leaderboard', userMiddleware, getLeaderboard);

module.exports = router;
