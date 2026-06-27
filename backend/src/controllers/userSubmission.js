const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {
  normalizeLanguage,
  judgeSubmission,
  runVisible,
  runCacheKey,
  getCachedRun,
  setCachedRun
} = require("../services/execution/executionService");
const { enqueueSubmission } = require("../services/execution/submissionQueue");

const submissionResponse = (submission) => ({
  submissionId: submission._id,
  status: submission.status,
  accepted: submission.status === 'accepted',
  totalTestCases: submission.testCasesTotal,
  passedTestCases: submission.testCasesPassed,
  runtime: submission.runtime,
  memory: submission.memory,
  errorMessage: submission.errorMessage || null
});

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    language = normalizeLanguage(language);

    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    // Store the submission as pending first
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: problem.hiddenTestCases.length
    });

    try {
      // Normal path: queue it and respond immediately; the worker judges it
      // in the background and the frontend polls /submission/status/:id.
      await enqueueSubmission(submission._id);
      return res.status(202).json({
        submissionId: submission._id,
        status: 'pending'
      });
    } catch (queueErr) {
      // Queue/Redis unavailable: judge inline (old synchronous behaviour).
      console.warn('Queue unavailable, judging inline:', queueErr.message);
      const judged = await judgeSubmission(submission._id);
      return res.status(201).json(submissionResponse(judged));
    }
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

const getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission)
      return res.status(404).json({ message: 'Submission not found' });

    if (String(submission.userId) !== String(req.result._id))
      return res.status(403).json({ message: 'Not your submission' });

    res.status(200).json(submissionResponse(submission));
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    language = normalizeLanguage(language);

    // Identical code on the same problem => same result, skip Judge0 entirely.
    const cacheKey = runCacheKey(problemId, language, code);
    const cached = await getCachedRun(cacheKey);
    if (cached)
      return res.status(200).json({ ...cached, cached: true });

    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).send("Problem not found");

    const result = await runVisible(problem, code, language);
    await setCachedRun(cacheKey, result);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

module.exports = { submitCode, runCode, getSubmissionStatus };
