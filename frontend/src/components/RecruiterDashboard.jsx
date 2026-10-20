import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axiosConfig";
import "./RecruiterDashboard.css";

function RecruiterDashboard({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("all");
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [savingJob, setSavingJob] = useState(false);
  const [message, setMessage] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    company_name: "",
    description: "",
    required_skills: "",
    location: "",
    job_type: "full_time",
    min_salary: "",
    max_salary: "",
    status: "published",
  });

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  // Load recruiter jobs and applications.
  const fetchDashboard = async (isRefresh = false) => {
    if (!token) {
      setError("Please log in to access the recruiter dashboard.");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      setMessage("");

      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.get("/jobs/", authConfig),
        api.get("/applications/recruiter-applications/", authConfig),
      ]);

      const jobsData = jobsResponse.data;
      const applicationsData = applicationsResponse.data;

      setJobs(
        Array.isArray(jobsData)
          ? jobsData
          : jobsData.results || []
      );

      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : applicationsData.results || []
      );

      if (isRefresh) {
        setMessage("Dashboard refreshed successfully.");
      }
    } catch (err) {
      console.error("Failed to load recruiter dashboard:", err);

      if (err.response?.status === 403) {
        setError(
          "This account does not have recruiter permissions. Please log in with an approved recruiter account."
        );
      } else if (err.response?.status === 401) {
        setError("Your login session is invalid. Please log in again.");
      } else {
        setError(
          "Unable to load dashboard data. Please check your Django backend and API permissions."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const resetJobForm = () => {
    setJobForm({
      title: "",
      company_name: "",
      description: "",
      required_skills: "",
      location: "",
      job_type: "full_time",
      min_salary: "",
      max_salary: "",
      status: "published",
    });

    setEditingJobId(null);
    setShowJobForm(false);
    setMessage("");
  };

  const handleJobInput = (event) => {
    const { name, value } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditJob = (job) => {
    setJobForm({
      title: job.title || "",
      company_name: job.company_name || "",
      description: job.description || "",
      required_skills: job.required_skills || "",
      location: job.location || "",
      job_type: job.job_type || "full_time",
      min_salary: job.min_salary ?? "",
      max_salary: job.max_salary ?? "",
      status: job.status || "published",
    });

    setEditingJobId(job.id);
    setShowJobForm(true);
    setActiveTab("jobs");
    setMessage("");
  };

  const handleSaveJob = async (event) => {
    event.preventDefault();
    setSavingJob(true);
    setMessage("");
    setError("");

    const payload = {
      ...jobForm,
      min_salary:
        jobForm.min_salary === "" ? null : jobForm.min_salary,
      max_salary:
        jobForm.max_salary === "" ? null : jobForm.max_salary,
    };

    try {
      if (editingJobId !== null) {
        await api.patch(
          `/jobs/${editingJobId}/`,
          payload,
          authConfig
        );

        setMessage("Job updated successfully!");
      } else {
        await api.post("/jobs/", payload, authConfig);
        setMessage("Job created successfully!");
      }

      setShowJobForm(false);
      setEditingJobId(null);

      await fetchDashboard();
    } catch (err) {
      console.error("Failed to save job:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const details = Object.entries(data)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : "";

            return text ? `${field}: ${text}` : "";
          })
          .filter(Boolean);

        setError(
          details.length
            ? details.join(" ")
            : "Unable to save the job. Please check the entered details."
        );
      } else {
        setError("Unable to save the job. Please try again.");
      }
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/jobs/${jobId}/`, authConfig);

      setMessage("Job deleted successfully!");
      await fetchDashboard();
    } catch (err) {
      console.error("Failed to delete job:", err);
      setError(
        "Unable to delete this job. Make sure you own this job and have recruiter permissions."
      );
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/applications/${applicationId}/update-status/`,
        { status },
        authConfig
      );

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );

      setMessage("Application status updated successfully!");
    } catch (err) {
      console.error("Failed to update application status:", err);
      setError(
        "Unable to update application status. Please check your recruiter permissions."
      );
    }
  };

  const openJobs = () => {
    setActiveTab("jobs");
    setShowJobForm(false);
    setApplicationFilter("all");
  };

  const openApplications = (filter = "all") => {
    setActiveTab("applications");
    setShowJobForm(false);
    setApplicationFilter(filter);
  };

  const jobTitles = [...new Set(
    applications
      .map((application) => application.job_title)
      .filter(Boolean)
  )];

  const visibleApplications = applications.filter((application) => {
    const matchesStatus =
      applicationFilter === "all" ||
      application.status === applicationFilter;

    const searchText = applicantSearch.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      (application.applicant_username || "").toLowerCase().includes(searchText);

    const matchesJob =
      jobTitleFilter === "all" ||
      application.job_title === jobTitleFilter;

    return matchesStatus && matchesSearch && matchesJob;
  });

  const statusCounts = {
    pending: applications.filter((application) => application.status === "pending").length,
    shortlisted: applications.filter((application) => application.status === "shortlisted").length,
    rejected: applications.filter((application) => application.status === "rejected").length,
    hired: applications.filter((application) => application.status === "hired").length,
  };

  // The notification count updates whenever application data changes.
  const pendingApplicationsCount = statusCounts.pending;

  const openPendingApplications = () => {
    setActiveTab("applications");
    setShowJobForm(false);
    setApplicationFilter("pending");
    setApplicantSearch("");
    setJobTitleFilter("all");
  };

  const hiringSuccessRate = applications.length
    ? Math.round((statusCounts.hired / applications.length) * 100)
    : 0;

  const chartData = [
    { name: "Pending", value: statusCounts.pending },
    { name: "Shortlisted", value: statusCounts.shortlisted },
    { name: "Rejected", value: statusCounts.rejected },
    { name: "Hired", value: statusCounts.hired },
  ].filter((item) => item.value > 0);

  const chartColors = ["#dca52d", "#3986c7", "#d9534f", "#319766"];

  const clearApplicationFilters = () => {
    setApplicantSearch("");
    setJobTitleFilter("all");
    setApplicationFilter("all");
  };

  if (loading) {
    return (
      <main className="recruiter-dashboard">
        <p>Loading recruiter dashboard...</p>
      </main>
    );
  }

  if (error && jobs.length === 0 && applications.length === 0) {
    return (
      <main className="recruiter-dashboard">
        <button className="details-back" onClick={onBack}>
          ← Back
        </button>

        <div className="recruiter-notice error">
          {error}
        </div>

        <button
          className="recruiter-primary-btn"
          onClick={fetchDashboard}
        >
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="recruiter-dashboard">
      <button className="details-back" onClick={onBack}>
        ← Back
      </button>

      <section className="recruiter-heading">
        <span className="eyebrow">RECRUITER WORKSPACE</span>
        <h1>Recruiter Dashboard</h1>
        <p>Manage your job listings and review candidates.</p>
        <button
          type="button"
          className="recruiter-primary-btn recruiter-refresh-btn"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          style={{ marginTop: "16px" }}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh Dashboard"}
        </button>

        <button
          type="button"
          className="recruiter-notification-btn"
          onClick={openPendingApplications}
          aria-label={`View ${pendingApplicationsCount} pending applications`}
          style={{ marginTop: "12px", marginLeft: "10px" }}
        >
          <span aria-hidden="true">🔔</span>
          Pending Applications
          <span className="recruiter-notification-badge">
            {pendingApplicationsCount}
          </span>
        </button>
      </section>

      <section className="recruiter-stats">
        <article
          role="button"
          tabIndex={0}
          onClick={openJobs}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openJobs();
            }
          }}
          style={{ cursor: "pointer" }}
          aria-label={`Open Manage Jobs, ${jobs.length} total jobs`}
        >
          <span>Total Jobs</span>
          <strong>{jobs.length}</strong>
          <small>Click to manage jobs</small>
        </article>

        <article
          role="button"
          tabIndex={0}
          onClick={() => openApplications("all")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openApplications("all");
            }
          }}
          style={{ cursor: "pointer" }}
          aria-label={`Open all applications, ${applications.length} total applications`}
        >
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
          <small>Click to view applicants</small>
        </article>

        <article
          role="button"
          tabIndex={0}
          onClick={() => openApplications("shortlisted")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openApplications("shortlisted");
            }
          }}
          style={{ cursor: "pointer" }}
          aria-label={`Open shortlisted applicants, ${
            applications.filter((application) => application.status === "shortlisted").length
          } shortlisted`}
        >
          <span>Shortlisted</span>
          <strong>
            {applications.filter(
              (application) => application.status === "shortlisted"
            ).length}
          </strong>
          <small>Click to view shortlisted candidates</small>
        </article>
      </section>

      <section className="recruiter-analytics">
        <div className="recruiter-analytics-heading">
          <h2>Hiring Analytics</h2>
          <p>Overview of applications for your job listings.</p>
        </div>

        <div className="recruiter-analytics-grid">
          <article className="recruiter-analytics-card">
            <span>Pending</span>
            <strong>{statusCounts.pending}</strong>
            <small>Awaiting review</small>
          </article>
          <article className="recruiter-analytics-card">
            <span>Shortlisted</span>
            <strong>{statusCounts.shortlisted}</strong>
            <small>Selected for next stage</small>
          </article>
          <article className="recruiter-analytics-card">
            <span>Rejected</span>
            <strong>{statusCounts.rejected}</strong>
            <small>Not proceeding</small>
          </article>
          <article className="recruiter-analytics-card">
            <span>Hired</span>
            <strong>{statusCounts.hired}</strong>
            <small>Successful hires</small>
          </article>
          <article className="recruiter-analytics-card recruiter-success-card">
            <span>Hiring Success Rate</span>
            <strong>{hiringSuccessRate}%</strong>
            <small>Hired applications ÷ all applications</small>
          </article>
        </div>

        <div className="recruiter-chart-panel">
          <h3>Application Status Distribution</h3>
          {chartData.length === 0 ? (
            <p className="recruiter-empty">
              No applications to chart yet. Status analytics will appear when candidates apply.
            </p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {message && (
        <div className="recruiter-notice success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="recruiter-notice error" role="alert">
          {error}
        </div>
      )}

      <div className="recruiter-tabs">
        <button
          className={activeTab === "jobs" ? "active" : ""}
          onClick={() => {
            setActiveTab("jobs");
            setApplicationFilter("all");
            setShowJobForm(false);
          }}
        >
          Manage Jobs
        </button>

        <button
          className={activeTab === "applications" ? "active" : ""}
          onClick={() => {
            setActiveTab("applications");
            setApplicationFilter("all");
            setShowJobForm(false);
          }}
        >
          View Applicants
        </button>
      </div>

      {activeTab === "jobs" && (
        <section className="recruiter-panel">
          <div className="recruiter-panel-heading">
            <h2>Your Job Listings</h2>

            {!showJobForm && (
              <button
                className="recruiter-primary-btn"
                onClick={() => {
                  resetJobForm();
                  setShowJobForm(true);
                }}
              >
                + Post a Job
              </button>
            )}
          </div>

          {showJobForm && (
            <form
              className="recruiter-job-form"
              onSubmit={handleSaveJob}
            >
              <h3>
                {editingJobId !== null
                  ? "Edit Job"
                  : "Create a New Job"}
              </h3>

              <label htmlFor="job-title">Job Title</label>
              <input
                id="job-title"
                name="title"
                value={jobForm.title}
                onChange={handleJobInput}
                required
              />

              <label htmlFor="company-name">Company Name</label>
              <input
                id="company-name"
                name="company_name"
                value={jobForm.company_name}
                onChange={handleJobInput}
                required
              />

              <label htmlFor="job-location">Location</label>
              <input
                id="job-location"
                name="location"
                value={jobForm.location}
                onChange={handleJobInput}
                required
              />

              <label htmlFor="job-type">Job Type</label>
              <select
                id="job-type"
                name="job_type"
                value={jobForm.job_type}
                onChange={handleJobInput}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>

              <label htmlFor="job-description">Job Description</label>
              <textarea
                id="job-description"
                name="description"
                rows="5"
                value={jobForm.description}
                onChange={handleJobInput}
                required
              />

              <label htmlFor="job-skills">Required Skills</label>
              <textarea
                id="job-skills"
                name="required_skills"
                rows="3"
                value={jobForm.required_skills}
                onChange={handleJobInput}
                required
              />

              <div className="recruiter-salary-fields">
                <div>
                  <label htmlFor="min-salary">
                    Minimum Salary
                  </label>
                  <input
                    id="min-salary"
                    name="min_salary"
                    type="number"
                    min="0"
                    value={jobForm.min_salary}
                    onChange={handleJobInput}
                  />
                </div>

                <div>
                  <label htmlFor="max-salary">
                    Maximum Salary
                  </label>
                  <input
                    id="max-salary"
                    name="max_salary"
                    type="number"
                    min="0"
                    value={jobForm.max_salary}
                    onChange={handleJobInput}
                  />
                </div>
              </div>

              <label htmlFor="job-status">Status</label>
              <select
                id="job-status"
                name="status"
                value={jobForm.status}
                onChange={handleJobInput}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>

              <div className="recruiter-form-actions">
                <button
                  className="recruiter-primary-btn"
                  type="submit"
                  disabled={savingJob}
                >
                  {savingJob
                    ? "Saving..."
                    : editingJobId !== null
                      ? "Save Changes"
                      : "Create Job"}
                </button>

                <button
                  className="recruiter-secondary-btn"
                  type="button"
                  onClick={resetJobForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showJobForm && jobs.length === 0 ? (
            <p className="recruiter-empty">
              No job listings were returned by the backend.
            </p>
          ) : !showJobForm ? (
            <div className="recruiter-job-list">
              {jobs.map((job) => (
                <article className="recruiter-job-card" key={job.id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>
                      {job.company_name} · {job.location}
                    </p>
                    <span className="recruiter-job-status">
                      {job.status || "Status unavailable"}
                    </span>
                  </div>

                  <div className="recruiter-card-actions">
                    <button
                      className="recruiter-secondary-btn"
                      onClick={() => handleEditJob(job)}
                    >
                      Edit
                    </button>

                    <button
                      className="recruiter-danger-btn"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {activeTab === "applications" && (
        <section className="recruiter-panel">
          <h2>{applicationFilter === "shortlisted" ? "Shortlisted Candidates" : "Candidate Applications"}</h2>

          <div
            className="recruiter-application-filters"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              margin: "18px 0 22px",
              alignItems: "end",
            }}
          >
            <div>
              <label htmlFor="applicant-search">Search by username</label>
              <input
                id="applicant-search"
                type="search"
                placeholder="Enter candidate username"
                value={applicantSearch}
                onChange={(event) => setApplicantSearch(event.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label htmlFor="application-status-filter">Application status</label>
              <select
                id="application-status-filter"
                value={applicationFilter}
                onChange={(event) => setApplicationFilter(event.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            <div>
              <label htmlFor="application-job-filter">Job title</label>
              <select
                id="application-job-filter"
                value={jobTitleFilter}
                onChange={(event) => setJobTitleFilter(event.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <option value="all">All jobs</option>
                {jobTitles.map((title) => (
                  <option value={title} key={title}>{title}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="recruiter-secondary-btn"
              onClick={clearApplicationFilters}
            >
              Clear Filters
            </button>
          </div>

          <p className="recruiter-empty" aria-live="polite">
            Showing {visibleApplications.length} of {applications.length} applications
          </p>

          {visibleApplications.length === 0 ? (
            <p className="recruiter-empty">
              {applicationFilter === "shortlisted" ? "No shortlisted candidates yet." : "No applications have been returned for your jobs yet."}
            </p>
          ) : (
            <div className="recruiter-application-list">
              {visibleApplications.map((application) => (
                <article
                  className="recruiter-application-card"
                  key={application.id}
                >
                  <div className="recruiter-applicant-icon">
                    {(application.applicant_username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="recruiter-applicant-info">
                    <h3>
                      {application.applicant_username ||
                        "Applicant"}
                    </h3>

                    <p>
                      {application.job_title ||
                        "Job title unavailable"}
                    </p>

                    <small>
                      Applied:{" "}
                      {application.applied_at
                        ? new Date(
                            application.applied_at
                          ).toLocaleDateString("en-IN")
                        : "Date unavailable"}
                    </small>

                    <button
                      type="button"
                      className="recruiter-secondary-btn"
                      aria-expanded={expandedApplicationId === application.id}
                      onClick={() =>
                        setExpandedApplicationId((currentId) =>
                          currentId === application.id ? null : application.id
                        )
                      }
                    >
                      {expandedApplicationId === application.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>

                    {expandedApplicationId === application.id && (
                      <div className="recruiter-applicant-details">
                        <p>
                          <strong>Email:</strong>{" "}
                          {application.applicant_email || "Not provided"}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {application.applicant_phone || "Not provided"}
                        </p>
                        <p>
                          <strong>Cover Letter:</strong>{" "}
                          {application.cover_letter?.trim()
                            ? application.cover_letter
                            : "No cover letter provided"}
                        </p>
                        <p>
                          <strong>Application Status:</strong>{" "}
                          {application.status || "Pending"}
                        </p>
                        <div className="recruiter-resume-action">
                          {application.applicant_resume ? (
                            <a
                              className="recruiter-secondary-btn"
                              href={application.applicant_resume}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Resume (PDF)
                            </a>
                          ) : (
                            <small>No resume uploaded</small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="recruiter-status-actions">
                    <label
                      htmlFor={`status-${application.id}`}
                    >
                      Application Status
                    </label>

                    <select
                      id={`status-${application.id}`}
                      value={application.status || "pending"}
                      onChange={(event) =>
                        handleApplicationStatus(
                          application.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default RecruiterDashboard;