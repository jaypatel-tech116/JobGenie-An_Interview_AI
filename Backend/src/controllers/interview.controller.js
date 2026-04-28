const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 * @access Private
 */
async function generateInterviewReportController(req, res) {
  try {
    // allow resume OR selfDescription
    if (!req.file && !req.body.selfDescription) {
      return res.status(400).json({
        success: false,
        message: "Either resume or self description is required",
      });
    }

    let resumeContent = "";
    // parse only if file exists
    if (req.file) {
      const data = await new pdfParse.PDFParse(
        Uint8Array.from(req.file.buffer),
      ).getText();

      resumeContent = data.text
        .replace(/-- \d+ of \d+ --/g, "")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();
    }

    const { selfDescription, jobDescription } = req.body;

    let interviewReportByAI;
    try {
      interviewReportByAI = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription,
      });
    } catch (err) {
      console.error("AI Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "AI service failed. Please try again.",
      });
    }

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      selfDescription,
      jobDescription,
      ...interviewReportByAI,
    });

    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully.",

      interviewReport: {
        id: interviewReport._id,
        user: interviewReport.user,

        title: interviewReport.title,
        matchScore: interviewReport.matchScore,

        jobDescription: interviewReport.jobDescription,
        selfDescription: interviewReport.selfDescription,

        technicalQuestions: interviewReport.technicalQuestions,
        behavioralQuestions: interviewReport.behavioralQuestions,
        skillGaps: interviewReport.skillGaps,
        preparationPlan: interviewReport.preparationPlan,

        createdAt: interviewReport.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate interview report",
    });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 * @access Private
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel
      .findOne({
        _id: interviewId,
        user: req.user.id,
      })
      .lean();

    if (!interviewReport) {
      return res.status(400).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview report",
    });
  }
}

/**
 * @description Controller to get all interview reports of logged in user.
 * @access Private
 */
async function getAllInterviewReportController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    console.error("Fetch All Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview reports",
    });
  }
}

/**
 * @description Controller to generate resume PDF based on user sel description, resume and job description.
 * @access Private
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    if (!interviewReportId) {
      return res.status(400).json({
        success: false,
        message: "Interview report ID is required",
      });
    }

    // ✅ secure: check user ownership
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found",
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const result = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
    });

    if (result.type === "pdf") {
      // Puppeteer succeeded — return PDF binary
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
        "Content-Length": result.data.length,
      });
      return res.end(result.data);
    }

    // Fallback — return styled HTML for client-side printing
    res.set({ "Content-Type": "text/html; charset=utf-8" });
    return res.send(result.data);
  } catch (err) {
    console.error("Resume PDF Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume PDF",
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportController,
  generateResumePdfController,
};
