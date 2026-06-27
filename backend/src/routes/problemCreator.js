const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,getCompanies,solvedAllProblembyUser,submittedProblem,warmProblemCaches} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");


// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/companies",userMiddleware, getCompanies);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);

// Admin endpoint to refresh problem cache (useful after seeding new problems)
problemRouter.post("/admin/refresh-cache", adminMiddleware, async (req, res) => {
  try {
    await warmProblemCaches();
    res.status(200).json({
      success: true,
      message: "Problem caches refreshed successfully"
    });
  } catch (err) {
    res.status(500).json({
      error: "Cache refresh failed: " + err.message
    });
  }
});

module.exports = problemRouter;

// fetch
// update
// delete 
