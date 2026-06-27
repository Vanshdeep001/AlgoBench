const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getNote, updateNote } = require('../controllers/note');

/**
 * @route   GET /note/:problemId
 * @desc    Get user note for a specific problem
 * @access  Protected
 */
router.get('/:problemId', userMiddleware, getNote);

/**
 * @route   PUT /note/:problemId
 * @desc    Create or update user note for a specific problem
 * @access  Protected
 */
router.put('/:problemId', userMiddleware, updateNote);

module.exports = router;
