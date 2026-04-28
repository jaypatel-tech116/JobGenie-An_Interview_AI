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
    try {
      const blob = await generateResumePdf({ interviewReportId });

      // Check if we got an error JSON instead of a real blob
      if (blob.type === "application/json") {
        const text = await blob.text();
        const errData = JSON.parse(text);
        throw new Error(errData.message || "PDF generation failed");
      }

      // If we got HTML back, open in new window for print
      if (blob.type === "text/html" || blob.type?.includes("html")) {
        const html = await blob.text();
        const printWindow = window.open("", "_blank");
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
        return;
      }

      // If we got a PDF blob, download it directly
      if (blob instanceof Blob && blob.size > 100) {
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

      throw new Error("Invalid response received");
    } catch (err) {
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
