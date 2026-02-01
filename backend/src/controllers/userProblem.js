const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo")

const createProblem = async (req, res) => {

  // API request to authenticate user:
  const { title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution, problemCreator
  } = req.body;


  try {

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

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

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
          return res.status(400).send("Test case failed: " + (test.status?.description || "Unknown error"));
        }

        // Validate output matches expected output
        const actualOutput = (test.stdout || "").trim();
        const expectedOutputTrimmed = expectedOutput.trim();

        if (actualOutput !== expectedOutputTrimmed) {
          return res.status(400).send(`Test case ${i + 1} failed: Expected "${expectedOutputTrimmed}" but got "${actualOutput}"`);
        }
      }

    }


    // We can store it in our DB

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id
    });

    res.status(201).send("Problem Saved Successfully");
  }
  catch (err) {
    console.error('Error in createProblem:', err);
    res.status(400).send({
      error: "Failed to create problem",
      message: err.message || "Unknown error occurred",
      details: err.response?.data || null
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

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

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
          return res.status(400).send("Test case failed: " + (test.status?.description || "Unknown error"));
        }

        // Validate output matches expected output
        const actualOutput = (test.stdout || "").trim();
        const expectedOutputTrimmed = expectedOutput.trim();

        if (actualOutput !== expectedOutputTrimmed) {
          return res.status(400).send(`Test case ${i + 1} failed: Expected "${expectedOutputTrimmed}" but got "${actualOutput}"`);
        }
      }

    }


    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });

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

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');

    // video ka jo bhi url wagera le aao

    if (!getProblem)
      return res.status(404).send("Problem is Missing");

    const videos = await SolutionVideo.findOne({ problemId: id });

    if (videos) {

      const responseData = {
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      }

      return res.status(200).send(responseData);
    }

    res.status(200).send(getProblem);

  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
}

const getAllProblem = async (req, res) => {

  try {

    const problems = await Problem.find({}).select('_id title difficulty tags');

    if (problems.length == 0)
      return res.status(404).send("Problem is Missing");

    // Calculate acceptance rate for each problem
    const problemsWithStats = await Promise.all(
      problems.map(async (problem) => {
        const totalSubmissions = await Submission.countDocuments({
          problemId: problem._id
        });

        const acceptedSubmissions = await Submission.countDocuments({
          problemId: problem._id,
          status: 'accepted'
        });

        const acceptanceRate = totalSubmissions > 0
          ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
          : '0.0';

        return {
          ...problem.toObject(),
          acceptanceRate: parseFloat(acceptanceRate)
        };
      })
    );

    res.status(200).send(problemsWithStats);
  }
  catch (err) {
    res.status(500).send("Error: " + err);
  }
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



module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblembyUser, submittedProblem };


