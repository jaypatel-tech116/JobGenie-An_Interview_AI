import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";
import { useCallback } from "react";
import { getToken } from "../../../config/api";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  const { interviewId } = useParams();

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  // Generate report
  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error("Generate Error:", error);
      return null; // safe return
    } finally {
      setLoading(false);
    }
  };

  // Get single report
  const getReportById = useCallback(async (interviewId) => {
    setLoading(true);
    try {
      const response = await getInterviewReportById(interviewId);
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (error) {
      console.error("Get Report Error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all reports
  const getReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (error) {
      console.error("Get Reports Error:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Download PDF via browser print
  const getResumePdf = async (interviewReportId) => {
    // Open window synchronously before any await to avoid popup blockers
    let printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <style>
              body {
                margin: 0;
                background: #0f0c1a;
                color: #f0eaff;
                font-family: 'DM Sans', sans-serif;
              }
              .loading-screen {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 24px;
              }
              .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(124, 58, 237, 0.2);
                border-top-color: #d4a017;
                border-right-color: #7c3aed;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              h1 {
                font-size: clamp(1.5rem, 4vw, 2.2rem);
                margin-top: 24px;
                background: linear-gradient(135deg, #f5c842 0%, #d4a017 50%, #a07010 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: pulseGlow 2s infinite ease-in-out;
                font-family: 'Cinzel', serif;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            </style>
          </head>
          <body>
            <div class="loading-screen">
              <div class="loading-spinner"></div>
              <h1>Generating your resume...</h1>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const blob = await generateResumePdf({ interviewReportId });

      // Check if we got an error JSON instead of a real blob
      if (blob.type === "application/json") {
        const text = await blob.text();
        const errData = JSON.parse(text);
        throw new Error(errData.message || "PDF generation failed");
      }

      // If we got HTML back, use the print window
      if (blob.type === "text/html" || blob.type?.includes("html")) {
        if (!printWindow) {
          throw new Error("Popup blocked! Please allow popups for this site.");
        }
        const html = await blob.text();
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for styles/images to load before printing
        setTimeout(() => {
          printWindow.print();
        }, 500);
        return;
      }

      // If we got a PDF blob, download it directly
      if (blob instanceof Blob && blob.size > 100) {
        if (printWindow) printWindow.close();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `resume_${interviewReportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      if (printWindow) printWindow.close();
      throw new Error("Invalid response received");
    } catch (err) {
      if (printWindow && !printWindow.closed) printWindow.close();
      console.error("Download error:", err);
      throw err;
    }
  };

  // Auto fetch — only when user is authenticated (token exists)
  useEffect(() => {
    const token = getToken();
    if (!token) return; // skip if not logged in

    if (interviewId) {
      getReportById(interviewId);
    } else {
      getReports();
    }
  }, [interviewId, getReportById, getReports]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
};
