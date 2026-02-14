const Contest = require('../models/contest');
const ContestAttempt = require('../models/contestAttempt');
const ContestSubmission = require('../models/contestSubmission');
const Problem = require('../models/problem');
const User = require('../models/user');
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');

const SCORE_PER_PROBLEM = 100;

function getContestStatus(contest) {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(start.getTime() + contest.duration * 60 * 1000);
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'finished';
}

async function ensureAttemptExpired(attempt) {
  if (attempt.status !== 'running') return attempt;
  const now = new Date();
  if (now > new Date(attempt.endTime)) {
    attempt.status = 'expired';
    await attempt.save();
  }
  return attempt;
}

// ----- Public (user) -----

exports.getContests = async (req, res) => {
  try {
    const contests = await Contest.find({ isPublished: true })
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'firstName lastName')
      .sort({ startTime: 1 })
      .lean();

    const now = new Date();
    const list = contests.map((c) => {
      const start = new Date(c.startTime);
      const end = new Date(start.getTime() + c.duration * 60 * 1000);
      let status = 'upcoming';
      if (now >= start && now <= end) status = 'live';
      else if (now > end) status = 'finished';
      return { ...c, status };
    });

    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId)
      .populate('problems', 'title difficulty tags')
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (!contest.isPublished && (!req.result || req.result.role !== 'admin')) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const status = getContestStatus(contest);
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000);
    return res.json({ ...contest, status, startTime: start, endTime: end });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch contest' });
  }
};

exports.startAttempt = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (!contest.isPublished) return res.status(400).json({ message: 'Contest is not published' });

    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(start.getTime() + contest.duration * 60 * 1000);

    if (now < start) return res.status(400).json({ message: 'Contest has not started yet' });
    if (now > end) return res.status(400).json({ message: 'Contest has ended' });

    const existing = await ContestAttempt.findOne({ contestId, userId });
    if (existing) {
      const attempt = await ensureAttemptExpired(existing);
      if (attempt.status === 'running') {
        return res.status(400).json({ message: 'You already have an active attempt' });
      }
      return res.status(400).json({ message: 'You have already attempted this contest' });
    }

    const attempt = await ContestAttempt.create({
      contestId,
      userId,
      startTime: now,
      endTime: end,
      score: 0,
      status: 'running',
    });

    return res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to start contest' });
  }
};

exports.getMyAttempt = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestId } = req.params;

    const attempt = await ContestAttempt.findOne({ contestId, userId });
    if (!attempt) return res.status(404).json({ message: 'No attempt found' });

    const updated = await ensureAttemptExpired(attempt);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch attempt' });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestAttemptId, problemId, code, language } = req.body;

    if (!contestAttemptId || !problemId || !code || !language) {
      return res.status(400).json({ message: 'Missing contestAttemptId, problemId, code, or language' });
    }

    const attempt = await ContestAttempt.findById(contestAttemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not your attempt' });
    }

    const updated = await ensureAttemptExpired(attempt);
    if (updated.status !== 'running') {
      return res.status(400).json({ message: 'Contest time is over. Submissions are locked.' });
    }

    const now = new Date();
    if (now > new Date(attempt.endTime)) {
      return res.status(400).json({ message: 'Contest time is over. Submissions are locked.' });
    }

    const contest = await Contest.findById(attempt.contestId);
    if (!contest || !contest.problems.some((p) => p.toString() === problemId)) {
      return res.status(400).json({ message: 'Problem not part of this contest' });
    }

    let lang = language;
    if (lang === 'cpp') lang = 'c++';

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const contestSubmission = await ContestSubmission.create({
      contestAttemptId,
      problemId,
      code,
      language: lang,
      verdict: 'pending',
      testCasesTotal: problem.hiddenTestCases.length,
    });

    const languageId = getLanguageById(lang);
    const submissions = problem.hiddenTestCases.map((tc) => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output,
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map((r) => r.token);
    const testResult = await submitToken(tokens);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let verdict = 'accepted';
    let errorMessage = '';

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time) || 0;
        memory = Math.max(memory, test.memory || 0);
      } else {
        verdict = test.status_id === 4 ? 'error' : 'wrong';
        errorMessage = test.stderr || '';
        break;
      }
    }

    contestSubmission.verdict = verdict;
    contestSubmission.testCasesPassed = testCasesPassed;
    contestSubmission.runtime = runtime;
    contestSubmission.memory = memory;
    contestSubmission.errorMessage = errorMessage;
    await contestSubmission.save();

    if (verdict === 'accepted') {
      const alreadyAccepted = await ContestSubmission.findOne({
        contestAttemptId,
        problemId,
        verdict: 'accepted',
        _id: { $ne: contestSubmission._id },
      });
      if (!alreadyAccepted) {
        attempt.score += SCORE_PER_PROBLEM;
        await attempt.save();
      }
    }

    return res.status(201).json({
      accepted: verdict === 'accepted',
      verdict,
      totalTestCases: contestSubmission.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      errorMessage: errorMessage || undefined,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Submission failed' });
  }
};

exports.runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const { contestAttemptId, problemId, code, language } = req.body;

    if (!contestAttemptId || !problemId || !code || !language) {
      return res.status(400).json({ message: 'Missing contestAttemptId, problemId, code, or language' });
    }

    const attempt = await ContestAttempt.findOne({ _id: contestAttemptId, userId });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    await ensureAttemptExpired(attempt);
    if (attempt.status !== 'running') {
      return res.status(400).json({ message: 'Contest has ended' });
    }

    const contest = await Contest.findById(attempt.contestId);
    if (!contest || !contest.problems.some((p) => p.toString() === problemId)) {
      return res.status(400).json({ message: 'Problem not part of this contest' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let lang = language;
    if (lang === 'cpp') lang = 'c++';
    const languageId = getLanguageById(lang);
    const submissions = problem.visibleTestCases.map((tc) => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output,
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map((r) => r.token);
    const testResult = await submitToken(tokens);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let success = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += parseFloat(test.time) || 0;
        memory = Math.max(memory, test.memory || 0);
      } else {
        success = false;
        errorMessage = test.stderr;
      }
    }

    return res.json({
      success,
      testCases: testResult,
      runtime,
      memory,
      errorMessage: errorMessage || undefined,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Run failed' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    if (!contest.isPublished) return res.status(404).json({ message: 'Contest not found' });

    const attempts = await ContestAttempt.find({ contestId })
      .populate('userId', 'firstName lastName')
      .sort({ score: -1, endTime: 1 })
      .lean();

    const withExpired = await Promise.all(
      attempts.map(async (a) => {
        const attempt = await ContestAttempt.findById(a._id);
        const updated = await ensureAttemptExpired(attempt);
        return { ...a, status: updated.status };
      })
    );

    const list = withExpired.map((a, index) => ({
      rank: index + 1,
      userId: a.userId._id,
      username: [a.userId.firstName, a.userId.lastName].filter(Boolean).join(' ') || 'User',
      score: a.score,
      endTime: a.endTime,
      status: a.status,
    }));

    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

// ----- Admin -----

exports.adminGetContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('problems', 'title difficulty')
      .populate('createdBy', 'firstName lastName')
      .sort({ startTime: -1 })
      .lean();
    return res.json(contests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

exports.adminCreateContest = async (req, res) => {
  try {
    const { title, description, problems, startTime, duration, scoringType } = req.body;
    if (!title || !startTime || !duration || !Array.isArray(problems)) {
      return res.status(400).json({ message: 'Missing title, startTime, duration, or problems array' });
    }

    const contest = await Contest.create({
      title,
      description: description || '',
      problems,
      startTime: new Date(startTime),
      duration: Number(duration),
      scoringType: scoringType || 'leetcode',
      isPublished: false,
      createdBy: req.result._id,
    });

    return res.status(201).json(contest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create contest' });
  }
};

exports.adminUpdateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.contestId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    return res.json(contest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update contest' });
  }
};

exports.adminDeleteContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    const attemptIds = (await ContestAttempt.find({ contestId: contest._id }).select('_id')).map((a) => a._id);
    await ContestSubmission.deleteMany({ contestAttemptId: { $in: attemptIds } });
    await ContestAttempt.deleteMany({ contestId: contest._id });
    await Contest.findByIdAndDelete(contest._id);
    return res.json({ message: 'Contest deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete contest' });
  }
};

exports.adminPublishContest = async (req, res) => {
  try {
    const { publish } = req.body;
    const contest = await Contest.findByIdAndUpdate(
      req.params.contestId,
      { isPublished: !!publish },
      { new: true }
    );
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    return res.json(contest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update contest' });
  }
};

exports.adminGetAttempts = async (req, res) => {
  try {
    const attempts = await ContestAttempt.find({ contestId: req.params.contestId })
      .populate('userId', 'firstName lastName emailId')
      .sort({ score: -1, endTime: 1 })
      .lean();
    return res.json(attempts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch attempts' });
  }
};
