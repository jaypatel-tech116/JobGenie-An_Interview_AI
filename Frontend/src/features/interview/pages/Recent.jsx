import { useNavigate } from "react-router";
import { useInterview } from "../hooks/useInterview";
import styles from "../styles/recent.module.scss";

const Recent = () => {
  const { reports, loading } = useInterview();
  const navigate = useNavigate();

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <span className="section-label">History</span>
        <h1 className={styles.title}>Recent Analyses</h1>
        <p className={styles.sub}>
          Revisit your generated reports and jump back into interview prep in
          one click.
        </p>
      </header>

      {loading ? (
        <div className={styles.loadingWrap}>
          <span className="spinner" />
          <span>Loading your history...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className={styles.empty}>
          <h2>No reports yet</h2>
          <p>Run your first resume analysis to start building history.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/interview")}
            type="button"
          >
            ✦ Analyze Resume
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {reports.map((report) => (
            <article
              key={report._id}
              className={styles.card}
              onClick={() => navigate(`/interview/${report._id}`)}
            >
              <div className={styles.cardTop}>
                <h3 className={styles.cardTitle}>
                  {report.title || "Untitled Position"}
                </h3>
                <span className={styles.score}>Match: {report.matchScore}%</span>
              </div>
              <p className={styles.meta}>
                Generated on {new Date(report.createdAt).toLocaleDateString()}
              </p>
              <span className={styles.open} style={{fontSize: "1rem", fontWeight: "600", color: "var(--gold-light)" }}>Open full report →</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Recent;
