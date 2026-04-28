const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const rateLimit = require("express-rate-limit");

const interviewRouter = express.Router();

// AI LIMITER (ONLY FOR GENERATE)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 AI calls per minute
  message: {
    success: false,
    message: "Too many AI requests. Please wait a moment.",
  },
});

/**
 * @route POST api/interview
 * @description Generate new interview report on the basis of user self description, resume pdf and job description
 * @access Private
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  aiLimiter,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

/**
 * @route GET api/interview/report/:interviewId
 * @description Get interview report by interviewId.
 * @access Private
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 * @route GET api/interview
 * @description Get all interview reports of logged in user.
 * @access Private
 */
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportController,
);

/**
 * @route POST /resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController,
);

module.exports = interviewRouter;
