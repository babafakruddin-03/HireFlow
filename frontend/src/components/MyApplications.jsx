import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import "./MyApplications.css";

function MyApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplications = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view your applications.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
      setSuccessMessage("");
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/applications/my-applications/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = response.data;
      const applicationList = Array.isArray(data)
        ? data
        : data.results || [];

      setApplications(applicationList);

      if (isRefresh) {
        setSuccessMessage("Your applications have been refreshed.");
      }
    } catch (err) {
      console.error("Failed to load applications:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Only job seekers can view this page.");
      } else {
        setError("Unable to load your applications. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const normalizedStatus = (status) =>
    (status || "pending").toLowerCase().trim();

  const statusCounts = useMemo(() => {
    const counts = {
      all: applications.length,
      pending: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };

    applications.forEach((application) => {
      const status = normalizedStatus(application.status);

      if (Object.prototype.hasOwnProperty.call(counts, status) && status !== "all") {
        counts[status] += 1;
      } else if (!["pending", "shortlisted", "rejected", "hired"].includes(status)) {
        counts.pending += 1;
      }
    });

    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") {
      return applications;
    }

    return applications.filter(
      (application) =>
        normalizedStatus(application.status) === statusFilter
    );
  }, [applications, statusFilter]);

  const getStatusClass = (status) => {
    switch (normalizedStatus(status)) {
      case "shortlisted":
        return "application-status status-shortlisted";
      case "rejected":
        return "application-status status-rejected";
      case "hired":
        return "application-status status-hired";
      default:
        return "application-status status-pending";
    }
  };

  const formatStatus = (status) => {
    const value = normalizedStatus(status);
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="my-applications-page">
      <button
        type="button"
        className="details-back"
        onClick={onBack}
      >
        ← Back to Jobs
      </button>

      <div className="applications-heading">
        <span className="eyebrow">YOUR CAREER JOURNEY</span>
        <h1>My Applications</h1>
        <p>Track your job applications and their latest status.</p>

        <button
          type="button"
          className="applications-refresh-btn"
          onClick={() => fetchApplications(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh Applications"}
        </button>
      </div>

      {successMessage && !loading && !error && (
        <div className="applications-success" role="status">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="applications-message applications-error">
          <h3>Unable to display applications</h3>
          <p>{error}</p>

          <button
            type="button"
            className="applications-retry-btn"
            onClick={() => fetchApplications()}
          >
            Try Again
          </button>
        </div>
      )}

      {loading && !error ? (
        <div className="applications-message">
          <h3>Loading your applications...</h3>
          <p>Please wait while we retrieve your application details.</p>
        </div>
      ) : !error ? (
        <>
          <section
            className="application-stats-grid"
            aria-label="Application statistics"
          >
            <button
              type="button"
              className={`application-stat-card stat-total ${
                statusFilter === "all" ? "stat-active" : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              <span className="application-stat-icon">📄</span>
              <span className="application-stat-label">Total Applied</span>
              <strong>{statusCounts.all}</strong>
              <span className="application-stat-caption">
                All applications
              </span>
            </button>

            <button
              type="button"
              className={`application-stat-card stat-pending ${
                statusFilter === "pending" ? "stat-active" : ""
              }`}
              onClick={() => setStatusFilter("pending")}
            >
              <span className="application-stat-icon">⏳</span>
              <span className="application-stat-label">Pending</span>
              <strong>{statusCounts.pending}</strong>
              <span className="application-stat-caption">
                Awaiting review
              </span>
            </button>

            <button
              type="button"
              className={`application-stat-card stat-shortlisted ${
                statusFilter === "shortlisted" ? "stat-active" : ""
              }`}
              onClick={() => setStatusFilter("shortlisted")}
            >
              <span className="application-stat-icon">⭐</span>
              <span className="application-stat-label">Shortlisted</span>
              <strong>{statusCounts.shortlisted}</strong>
              <span className="application-stat-caption">
                Selected for the next stage
              </span>
            </button>

            <button
              type="button"
              className={`application-stat-card stat-rejected ${
                statusFilter === "rejected" ? "stat-active" : ""
              }`}
              onClick={() => setStatusFilter("rejected")}
            >
              <span className="application-stat-icon">✕</span>
              <span className="application-stat-label">Rejected</span>
              <strong>{statusCounts.rejected}</strong>
              <span className="application-stat-caption">
                Not selected
              </span>
            </button>

            <button
              type="button"
              className={`application-stat-card stat-hired ${
                statusFilter === "hired" ? "stat-active" : ""
              }`}
              onClick={() => setStatusFilter("hired")}
            >
              <span className="application-stat-icon">🎉</span>
              <span className="application-stat-label">Hired</span>
              <strong>{statusCounts.hired}</strong>
              <span className="application-stat-caption">
                Successful applications
              </span>
            </button>
          </section>

          <section className="applications-results-section">
            <div className="applications-results-heading">
              <div>
                <h2>
                  {statusFilter === "all"
                    ? "All Applications"
                    : `${formatStatus(statusFilter)} Applications`}
                </h2>
                <p>
                  Showing {filteredApplications.length}{" "}
                  {filteredApplications.length === 1
                    ? "application"
                    : "applications"}
                </p>
              </div>

              {statusFilter !== "all" && (
                <button
                  type="button"
                  className="applications-clear-filter"
                  onClick={() => setStatusFilter("all")}
                >
                  Clear Filter
                </button>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="applications-message">
                <div className="applications-empty-icon">📂</div>
                <h3>No applications yet</h3>
                <p>
                  Explore available jobs and apply for your first opportunity.
                </p>
                <button
                  type="button"
                  className="applications-retry-btn"
                  onClick={onBack}
                >
                  Explore Jobs
                </button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="applications-message">
                <h3>No {statusFilter} applications</h3>
                <p>
                  You don't have any applications with this status right now.
                </p>
                <button
                  type="button"
                  className="applications-retry-btn"
                  onClick={() => setStatusFilter("all")}
                >
                  View All Applications
                </button>
              </div>
            ) : (
              <div className="applications-list">
                {filteredApplications.map((application) => (
                  <article
                    className="application-card"
                    key={application.id}
                  >
                    <div className="application-company-icon">
                      {(application.company_name || "H")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="application-info">
                      <h2>
                        {application.job_title || "Job title unavailable"}
                      </h2>

                      <p className="application-company">
                        {application.company_name || "Company unavailable"}
                      </p>

                      <p className="application-date">
                        Applied on: {formatDate(application.applied_at)}
                      </p>
                    </div>

                    <div className="application-status-container">
                      <span className={getStatusClass(application.status)}>
                        {formatStatus(application.status)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}

export default MyApplications;