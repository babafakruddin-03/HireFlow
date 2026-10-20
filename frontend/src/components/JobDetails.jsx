import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "./JobDetails.css";

function JobDetails({ jobId, onBack }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Application states
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  // Fetch job details from Django backend
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/jobs/${jobId}/`);
        setJob(response.data);
      } catch (err) {
        console.error("Failed to load job details:", err);
        setError("Unable to load this job. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Apply for a job
  const handleApply = async () => {
    // Check whether the user is logged in
    const token = localStorage.getItem("token");

    if (!token) {
      setApplicationMessage(
        "Please log in as a job seeker before applying."
      );
      return;
    }

    try {
      setApplying(true);
      setApplicationMessage("");

      const response = await api.post(
        "/applications/apply/",
        {
          job: jobId,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setApplicationMessage(
        response.data?.message ||
          "Application submitted successfully!"
      );
    } catch (err) {
      console.error("Failed to apply for job:", err);

      if (err.response?.status === 400) {
        const data = err.response.data;

        const message =
          data.detail ||
          data.job?.[0] ||
          data.non_field_errors?.[0] ||
          data.error ||
          "You may have already applied for this job. Please check your applications.";

        setApplicationMessage(
          typeof message === "string"
            ? message
            : "Unable to submit your application. Please check your details."
        );
      } else if (err.response?.status === 401) {
        setApplicationMessage(
          "Your login session is invalid. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setApplicationMessage(
          "Only logged-in job seekers can apply for jobs."
        );
      } else {
        setApplicationMessage(
          "Unable to submit your application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="details-page">
        <p>Loading job details...</p>
      </main>
    );
  }

  // Error screen
  if (error || !job) {
    return (
      <main className="details-page">
        <p>{error || "Job not found."}</p>

        <button className="details-back" onClick={onBack}>
          Back to Jobs
        </button>
      </main>
    );
  }

  // Job details page
  return (
    <main className="details-page">
      <button className="details-back" onClick={onBack}>
        ← Back to Jobs
      </button>

      <section className="details-card">
        <div className="details-company-icon">
          {(job.company_name || "H").charAt(0).toUpperCase()}
        </div>

        <span className="details-badge">
          {(job.job_type || "Job").replace("_", " ")}
        </span>

        <h1>{job.title}</h1>

        <h2>{job.company_name}</h2>

        <div className="details-meta">
          <span>
            📍 {job.location || "Location not specified"}
          </span>

          <span>
            💰 ₹{job.min_salary ?? "—"} – ₹{job.max_salary ?? "—"}
          </span>
        </div>

        <hr />

        <h3>Job Description</h3>

        <p className="details-description">
          {job.description || "No description provided."}
        </p>

        <h3>Required Skills</h3>

        <p className="details-description">
          {job.required_skills || "Skills not specified."}
        </p>

        {/* Apply button */}
        <button
          className="details-apply"
          onClick={handleApply}
          disabled={applying}
        >
          {applying ? "Submitting Application..." : "Apply for this Job"}
        </button>

        {/* Application success or error message */}
        {applicationMessage && (
          <p
            role="status"
            aria-live="polite"
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#eff8f0",
              color: "#205b43",
              lineHeight: "1.6",
            }}
          >
            {applicationMessage}
          </p>
        )}
      </section>
    </main>
  );
}

export default JobDetails;