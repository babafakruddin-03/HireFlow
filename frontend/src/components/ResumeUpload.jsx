import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "./ResumeUpload.css";

function ResumeUpload({ onBack }) {
  const [resume, setResume] = useState(null);
  const [currentResume, setCurrentResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await api.get("/auth/me/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setCurrentResume(response.data.resume || "");
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load your resume information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchResume();
    } else {
      setError("Please log in before uploading a resume.");
      setLoading(false);
    }
  }, [token]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!resume) {
      setError("Please select a PDF resume.");
      return;
    }

    if (resume.type !== "application/pdf" &&
        !resume.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    if (resume.size > 5 * 1024 * 1024) {
      setError("The resume must be 5 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    setUploading(true);

    try {
      const response = await api.post(
        "/auth/resume/upload/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setCurrentResume(response.data.resume || "");
      setResume(null);
      event.target.reset();
      setMessage("Resume uploaded successfully!");
    } catch (err) {
      setError(
        err.response?.data?.resume?.[0] ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="resume-page">
      <div className="resume-card">
        <button className="resume-back" onClick={onBack}>
          ← Back
        </button>

        <div className="resume-heading">
          <span className="resume-icon">📄</span>
          <h1>My Resume</h1>
          <p>Upload your resume to help recruiters discover your skills.</p>
        </div>

        {loading ? (
          <p>Loading your resume information...</p>
        ) : (
          <>
            {currentResume && (
              <div className="current-resume">
                <h3>Resume uploaded</h3>
                <a
                  href={currentResume}
                  target="_blank"
                  rel="noreferrer"
                >
                  View your current resume ↗
                </a>
              </div>
            )}

            <form onSubmit={handleUpload}>
              <label htmlFor="resume-file">
                Choose resume (PDF, maximum 5 MB)
              </label>

              <input
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setResume(event.target.files?.[0] || null)
                }
              />

              {resume && (
                <p className="selected-resume">
                  Selected: {resume.name}
                </p>
              )}

              <button
                type="submit"
                className="resume-upload-btn"
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : currentResume
                    ? "Replace Resume"
                    : "Upload Resume"}
              </button>
            </form>

            {message && (
              <p className="resume-success">{message}</p>
            )}

            {error && (
              <p className="resume-error">{error}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ResumeUpload;