const crypto = require('crypto');
const Problem = require('../../models/problem');
const Submission = require('../../models/submission');
const User = require('../../models/user');
const redisClient = require('../../config/redis');
const { getLanguageById, submitBatch, submitToken } = require('./judge0Client');

const normalizeLanguage = (language) => (language === 'cpp' ? 'c++' : language);

// Send a set of test cases to Judge0 and wait for all verdicts.
const judgeTestCases = async (code, language, testCases) => {
    const languageId = getLanguageById(language);
    if (!languageId) throw new Error('Unsupported language: ' + language);

    const submissions = testCases.map((testcase) => ({
        source_code: code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map((value) => value.token);
    return submitToken(tokens);
};

// Same verdict logic as before: status_id 3 = passed, 4 = error, anything else = wrong.
const summarizeResults = (testResult) => {
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
        if (test.status_id == 3) {
            testCasesPassed++;
            runtime = runtime + parseFloat(test.time);
            memory = Math.max(memory, test.memory);
        } else if (test.status_id == 4) {
            status = 'error';
            errorMessage = test.stderr;
        } else {
            status = 'wrong';
            errorMessage = test.stderr;
        }
    }

    return { testCasesPassed, runtime, memory, status, errorMessage };
};

// Judge a pending submission against the problem's hidden test cases and persist
// the verdict. Used by the queue worker, and inline when the queue is unavailable.
const judgeSubmission = async (submissionId) => {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found: ' + submissionId);
    if (submission.status !== 'pending') return submission; // already judged (job retry)

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
        submission.status = 'error';
        submission.errorMessage = 'Problem not found';
        await submission.save();
        return submission;
    }

    const testResult = await judgeTestCases(submission.code, submission.language, problem.hiddenTestCases);
    const { testCasesPassed, runtime, memory, status, errorMessage } = summarizeResults(testResult);

    submission.status = status;
    submission.testCasesPassed = testCasesPassed;
    submission.errorMessage = errorMessage;
    submission.runtime = runtime;
    submission.memory = memory;
    await submission.save();

    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not present there.
    const user = await User.findById(submission.userId);
    if (user && !user.problemSolved.includes(submission.problemId)) {
        user.problemSolved.push(submission.problemId);
        await user.save();
    }

    return submission;
};

// Called by the worker when a job has exhausted its retries, so the
// submission doesn't stay "pending" forever.
const markSubmissionFailed = async (submissionId, message) => {
    const submission = await Submission.findById(submissionId);
    if (!submission || submission.status !== 'pending') return;
    submission.status = 'error';
    submission.errorMessage = message;
    await submission.save();
};

// Run against (a few) visible test cases for the Run button.
const runVisible = async (problem, code, language) => {
    const maxCases = parseInt(process.env.RUN_MAX_TESTCASES || '3', 10);
    const cases = problem.visibleTestCases.slice(0, maxCases);
    const testResult = await judgeTestCases(code, language, cases);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let success = true;

    for (const test of testResult) {
        if (test.status_id == 3) {
            testCasesPassed++;
            runtime = runtime + parseFloat(test.time);
            memory = Math.max(memory, test.memory);
        } else {
            success = false;
        }
    }

    return { success, testCases: testResult, runtime, memory, engine: 'judge0' };
};

// --- Run result cache (identical code + problem + language => same output) ---

const runCacheKey = (problemId, language, code) =>
    'runcache:' + crypto.createHash('sha256').update(problemId + '|' + language + '|' + code).digest('hex');

const getCachedRun = async (key) => {
    if (!redisClient.isReady) return null;
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        return null;
    }
};

const setCachedRun = async (key, result) => {
    if (!redisClient.isReady) return;
    try {
        const ttl = parseInt(process.env.RUN_CACHE_TTL_SECONDS || '120', 10);
        await redisClient.setEx(key, ttl, JSON.stringify(result));
    } catch (err) {
        // cache is best-effort
    }
};

module.exports = {
    normalizeLanguage,
    judgeSubmission,
    markSubmissionFailed,
    runVisible,
    runCacheKey,
    getCachedRun,
    setCachedRun
};
