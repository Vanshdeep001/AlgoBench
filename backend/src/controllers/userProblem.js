const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");

/** Detect if reference solutions look like function-style (LeetCode) rather than full programs. */
function looksLikeFunctionStyle(referenceSolution, visibleTestCases) {
  if (!referenceSolution?.length || !visibleTestCases?.length) return false;
  const firstInput = (visibleTestCases[0].input || "").trim();
  const hasExpressionInput = /nums\s*=\s*\[|target\s*=/.test(firstInput);
  let hasFunctionCode = false;
  for (const { language, completeCode } of referenceSolution) {
    const code = (completeCode || "").trim();
    const noMain = !/int\s+main\s*\(|public\s+static\s+void\s+main|readFileSync\s*\(\s*0|process\.stdin/.test(code);
    const hasClassOrFunc = /class\s+Solution|linearSearch\s*\(|function\s*\(\s*nums/.test(code);
    if (noMain && hasClassOrFunc) hasFunctionCode = true;
  }
  return hasExpressionInput && hasFunctionCode;
}

const FORMAT_HINT = " This system runs complete programs: code must read from stdin and print the result to stdout. Test input must be plain text (e.g. first line: n, second line: space-separated numbers, third line: target). Use the sample format from the Linear Search problem (see Import from JSON sample or linear-search-problem.json).";

const createProblem = async (req, res) => {

  const { title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution, problemCreator,
    skipReferenceValidation
  } = req.body;

  // Only run Judge0 when explicitly false (string "false" or boolean false). Default = skip.
  const runJudge0Validation = skipReferenceValidation === false || skipReferenceValidation === 'false';

  try {
    if (runJudge0Validation) {
    for (const { language, completeCode } of referenceSolution) {


      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:


      const languageId = getLanguageById(language);

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported languages are: c++, java, javascript`);
      }

      // Unescape the source code (convert \\n to actual newlines, \\t to tabs, etc.)
      const unescapedCode = completeCode.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');

      // I am creating Batch submission (Judge0 doesn't accept expected_output)
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: unescapedCode,
        language_id: languageId,
        stdin: testcase.input
      }));


      const submitResult = await submitBatch(submissions);

      if (!submitResult || !Array.isArray(submitResult)) {
        throw new Error('Invalid response from Judge0 API during submission');
      }

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      if (!testResult || !Array.isArray(testResult)) {
        throw new Error('Invalid response from Judge0 API during result retrieval');
      }

      console.log(testResult);

      // Validate each test case result
      for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const expectedOutput = visibleTestCases[i].output;

        // Check if execution was successful (status_id 3 = Accepted)
        if (test.status_id != 3) {
          const baseMsg = "Test case failed: " + (test.status?.description || "Unknown error");
          const hint = looksLikeFunctionStyle(referenceSolution, visibleTestCases) ? FORMAT_HINT : "";
          return res.status(400).json({
            error: "Reference solution failed",
            message: baseMsg + hint,
            testCaseIndex: i + 1,
            language,
            judge0Status: test.status?.description,
            stderr: test.stderr || null,
            stdout: (test.stdout || "").trim() || null
          });
        }

        // Validate output matches expected output
        const actualOutput = (test.stdout || "").trim();
        const expectedOutputTrimmed = expectedOutput.trim();

        if (actualOutput !== expectedOutputTrimmed) {
          const baseMsg = `Test case ${i + 1} failed: Expected "${expectedOutputTrimmed}" but got "${actualOutput}"`;
          const hint = looksLikeFunctionStyle(referenceSolution, visibleTestCases) ? FORMAT_HINT : "";
          return res.status(400).json({
            error: "Reference solution failed",
            message: baseMsg + hint,
            testCaseIndex: i + 1,
            language,
            stderr: test.stderr || null,
            stdout: actualOutput || null
          });
        }
      }

    }
    }

    // Strip skipReferenceValidation so it is not stored in DB
    const { skipReferenceValidation: _, ...bodyForDb } = req.body;
    const userProblem = await Problem.create({
      ...bodyForDb,
      problemCreator: req.result._id
    });

    invalidateProblemCaches();
    res.status(201).send("Problem Saved Successfully");
  }
  catch (err) {
    console.error('Error in createProblem:', err);
    let message = err.message || "Unknown error occurred";
    const judge0Response = err.response?.data;
    const judge0Status = err.response?.status;
    if (judge0Status === 403 || (judge0Response && String(judge0Response.message || '').toLowerCase().includes('not subscribed'))) {
      message = "Judge0/RapidAPI error: You are not subscribed to this API (403). Keep 'Skip reference solution validation' checked to create the problem without running code, or subscribe to Judge0 CE on RapidAPI.";
    } else if (err.response?.data?.message) {
      message = err.response.data.message;
    }
    return res.status(400).json({
      error: "Failed to create problem",
      message,
      details: judge0Response || null
    });
  }
}

const updateProblem = async (req, res) => {

  const { id } = req.params;
  const { title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution, problemCreator
  } = req.body;

  try {

    if (!id) {
      return res.status(400).send("Missing ID Field");
    }

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("ID is not persent in server");
    }

    for (const { language, completeCode } of referenceSolution) {


      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}. Supported languages are: c++, java, javascript`);
      }

      // Unescape the source code (convert \\n to actual newlines, \\t to tabs, etc.)
      const unescapedCode = completeCode.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');

      // I am creating Batch submission (Judge0 doesn't accept expected_output)
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: unescapedCode,
        language_id: languageId,
        stdin: testcase.input
      }));


      const submitResult = await submitBatch(submissions);

      if (!submitResult || !Array.isArray(submitResult)) {
        throw new Error('Invalid response from Judge0 API during submission');
      }

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      if (!testResult || !Array.isArray(testResult)) {
        throw new Error('Invalid response from Judge0 API during result retrieval');
      }

      // Validate each test case result
      for (let i = 0; i < testResult.length; i++) {
        const test = testResult[i];
        const expectedOutput = visibleTestCases[i].output;

        // Check if execution was successful (status_id 3 = Accepted)
        if (test.status_id != 3) {
          return res.status(400).json({
            error: "Reference solution failed",
            message: "Test case failed: " + (test.status?.description || "Unknown error"),
            testCaseIndex: i + 1
          });
        }

        // Validate output matches expected output
        const actualOutput = (test.stdout || "").trim();
        const expectedOutputTrimmed = expectedOutput.trim();

        if (actualOutput !== expectedOutputTrimmed) {
          return res.status(400).json({
            error: "Reference solution failed",
            message: `Test case ${i + 1} failed: Expected "${expectedOutputTrimmed}" but got "${actualOutput}"`,
            testCaseIndex: i + 1
          });
        }
      }

    }


    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

    invalidateProblemCaches();
    res.status(200).send(newProblem);
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

const deleteProblem = async (req, res) => {

  const { id } = req.params;
  try {

    if (!id)
      return res.status(400).send("ID is Missing");

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem)
      return res.status(404).send("Problem is Missing");

    invalidateProblemCaches();
    res.status(200).send("Successfully Deleted");
  }
  catch (err) {

    res.status(500).send("Error: " + err);
  }
}


const getProblemById = async (req, res) => {

  const { id } = req.params;
  try {

    if (!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution source problemType leetcodeLink slug topics companies frequency acceptance');

    if (!getProblem)
      return res.status(404).send("Problem is Missing");

    res.status(200).send(getProblem);

  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

const LIST_PROJECTION = 'title slug difficulty tags topics source problemType leetcodeLink frequency acceptance companyCount companies';
const LIST_SORT = { companyCount: -1, frequency: -1, title: 1 };
const CACHE_TTL_MS = 5 * 60 * 1000;

// In-memory caches (same for every user; rebuilt every few minutes).
// CACHE CLEARED - fresh load on startup
let _listCache = { data: null, at: 0 };
let _companiesCache = { data: null, at: 0 };

// Build the lightweight, sorted problem list with computed acceptanceRate.
async function buildProblemList(filter = {}) {
  const problems = await Problem.find(filter).select(LIST_PROJECTION).sort(LIST_SORT).lean();
  if (problems.length === 0) return [];

  // Live acceptance for solvable problems via ONE aggregation (not per-problem).
  const solvableIds = problems.filter((p) => p.problemType !== 'catalog').map((p) => p._id);
  const statsMap = {};
  if (solvableIds.length) {
    const stats = await Submission.aggregate([
      { $match: { problemId: { $in: solvableIds } } },
      { $group: { _id: '$problemId', total: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } } } },
    ]);
    stats.forEach((s) => { statsMap[s._id.toString()] = s.total > 0 ? parseFloat(((s.accepted / s.total) * 100).toFixed(1)) : 0; });
  }

  return problems.map((p) => {
    const acceptanceRate = p.problemType === 'catalog'
      ? (p.acceptance != null ? parseFloat((p.acceptance * 100).toFixed(1)) : 0)
      : (statsMap[p._id.toString()] ?? 0);
    return { ...p, acceptanceRate };
  });
}

// Warm the unfiltered list + companies caches (called on boot and lazily).
async function warmProblemCaches() {
  try {
    _listCache = { data: await buildProblemList({}), at: Date.now() };
    const names = await Problem.distinct('companies.name');
    _companiesCache = { data: names.filter(Boolean).sort((a, b) => a.localeCompare(b)), at: Date.now() };
  } catch (err) {
    console.error('warmProblemCaches failed:', err.message);
  }
}

const getAllProblem = async (req, res) => {
  try {
    const { company, difficulty, tag, type, search } = req.query;
    const hasFilter = company || (difficulty && difficulty !== 'all') || (tag && tag !== 'all') || (type && type !== 'all') || search;

    // Unfiltered (the default page load): serve from cache.
    if (!hasFilter) {
      if (_listCache.data && Date.now() - _listCache.at < CACHE_TTL_MS) {
        return res.status(200).send(_listCache.data);
      }
      const data = await buildProblemList({});
      _listCache = { data, at: Date.now() };
      return res.status(200).send(data);
    }

    // Filtered query (e.g. by company): go to DB.
    const filter = {};
    if (company) filter['companies.name'] = company;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (tag && tag !== 'all') filter.tags = tag;
    if (type && type !== 'all') filter.problemType = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const result = await buildProblemList(filter);
    res.status(200).send(result);
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

// Distinct company list for the Problems page company filter (cached).
const getCompanies = async (req, res) => {
  try {
    if (_companiesCache.data && Date.now() - _companiesCache.at < CACHE_TTL_MS) {
      return res.status(200).send(_companiesCache.data);
    }
    const names = await Problem.distinct('companies.name');
    const companies = names.filter(Boolean).sort((a, b) => a.localeCompare(b));
    _companiesCache = { data: companies, at: Date.now() };
    res.status(200).send(companies);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
}

// Invalidate caches when problems are created/updated/deleted.
function invalidateProblemCaches() {
  _listCache = { data: null, at: 0 };
  _companiesCache = { data: null, at: 0 };
}


const solvedAllProblembyUser = async (req, res) => {

  try {

    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags"
    });

    res.status(200).send(user.problemSolved);

  }
  catch (err) {
    res.status(500).send("Server Error");
  }
}

const submittedProblem = async (req, res) => {

  try {

    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find({ userId, problemId });

    if (ans.length == 0)
      res.status(200).send("No Submission is persent");

    res.status(200).send(ans);

  }
  catch (err) {
    res.status(500).send("Internal Server Error");
  }
}



module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, getCompanies, solvedAllProblembyUser, submittedProblem, warmProblemCaches, invalidateProblemCaches };


