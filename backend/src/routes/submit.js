
const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const rateLimiter = require("../middleware/rateLimiter");
const {submitCode,runCode,getSubmissionStatus} = require("../controllers/userSubmission");

const runLimiter = rateLimiter({ action: 'run', max: 15, windowSeconds: 60 });
const submitLimiter = rateLimiter({ action: 'submit', max: 6, windowSeconds: 60 });

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, runLimiter, runCode);
submitRouter.get("/status/:submissionId", userMiddleware, getSubmissionStatus);

module.exports = submitRouter;
