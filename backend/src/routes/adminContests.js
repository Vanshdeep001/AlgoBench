const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  adminGetContests,
  adminCreateContest,
  adminUpdateContest,
  adminDeleteContest,
  adminPublishContest,
  adminGetAttempts,
} = require('../controllers/contestController');

router.get('/', adminMiddleware, adminGetContests);
router.post('/', adminMiddleware, adminCreateContest);
router.put('/:contestId', adminMiddleware, adminUpdateContest);
router.delete('/:contestId', adminMiddleware, adminDeleteContest);
router.patch('/:contestId/publish', adminMiddleware, adminPublishContest);
router.get('/:contestId/attempts', adminMiddleware, adminGetAttempts);

module.exports = router;
