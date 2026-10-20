import { useEffect, useState } from "react";
import api from "./api/axiosConfig";
import JobDetails from "./components/JobDetails";
import Login from "./components/Login";
import MyApplications from "./components/MyApplications";
import Register from "./components/Register";
import RecruiterDashboard from "./components/RecruiterDashboard";
import ResumeUpload from "./components/ResumeUpload";
import "./App.css";

function App() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showRecruiterDashboard, setShowRecruiterDashboard] =
    useState(false);

  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("username") || ""
  );

  const [currentRole, setCurrentRole] = useState(
    () => localStorage.getItem("role") || ""
  );

  // Fetch published jobs.
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/jobs/");
        const data = response.data;

        setJobs(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setError(
          "Unable to load jobs. Please make sure the Django backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Check the logged-in user's role using the Django API.
  const fetchCurrentRole = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCurrentRole("");
      localStorage.removeItem("role");
      return "";
    }

    try {
      const response = await api.get("/auth/me/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = response.data;

      const role =
        data.role ||
        data.profile?.role ||
        data.user?.profile?.role ||
        "";

      setCurrentRole(role);

      if (role) {
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("role");
      }

      return role;
    } catch (err) {
      console.error("Unable to fetch account role:", err);
      setCurrentRole("");
      localStorage.removeItem("role");
      return "";
    }
  };

  // Handle successful login.
  const handleLoginSuccess = async (userData) => {
    const username =
      userData.username || userData.user?.username || "";

    if (username) {
      localStorage.setItem("username", username);
    }

    setCurrentUser(username);

    // Determine the role from the backend.
    await fetchCurrentRole();

    setShowLogin(false);
    setShowRegister(false);
  };

  // Handle logout.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setCurrentUser("");
    setCurrentRole("");
    setSelectedJobId(null);
    setShowApplications(false);
    setShowResume(false);
    setShowLogin(false);
    setShowRegister(false);
    setShowRecruiterDashboard(false);

    alert("You have logged out.");
  };

  // Return to homepage.
  const goHome = () => {
    setSelectedJobId(null);
    setShowApplications(false);
    setShowResume(false);
    setShowLogin(false);
    setShowRegister(false);
    setShowRecruiterDashboard(false);
  };

  // Open login.
  const openLogin = () => {
    setSelectedJobId(null);
    setShowApplications(false);
    setShowResume(false);
    setShowRegister(false);
    setShowRecruiterDashboard(false);
    setShowLogin(true);
  };

  // Open registration.
  const openRegister = () => {
    setSelectedJobId(null);
    setShowApplications(false);
    setShowResume(false);
    setShowLogin(false);
    setShowRecruiterDashboard(false);
    setShowRegister(true);
  };

  // Open the recruiter dashboard only for recruiter accounts.
  const openRecruiterDashboard = async () => {
    const role = await fetchCurrentRole();

    if (role !== "recruiter") {
      alert(
        "Your account does not have recruiter permissions."
      );
      return;
    }

    setShowLogin(false);
    setShowRegister(false);
    setShowApplications(false);
    setShowResume(false);
    setSelectedJobId(null);
    setShowRecruiterDashboard(true);
  };

  // Search jobs.
  const filteredJobs = jobs.filter((job) => {
    const searchText = keyword.toLowerCase().trim();
    const searchLocation = location.toLowerCase().trim();

    const searchableText = [
      job.title,
      job.company_name,
      job.required_skills,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      searchableText.includes(searchText) &&
      (job.location || "").toLowerCase().includes(searchLocation)
    );
  });

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <a className="logo" href="#home" onClick={goHome}>
          Hire<span>Flow</span>
          <div className="logo-caption">CAREERS THAT MOVE YOU</div>
        </a>

        <nav className="nav-links">
          <a href="#home" onClick={goHome}>
            Home
          </a>

          <a href="#jobs" onClick={goHome}>
            Find Jobs
          </a>

          <a href="#about" onClick={goHome}>
            About
          </a>
        </nav>

        <div className="nav-actions">
          {currentUser && currentRole === "job_seeker" && (
            <button
              className="login-btn"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(false);
                setShowRecruiterDashboard(false);
                setSelectedJobId(null);
                setShowApplications(true);
              }}
            >
              My Applications
            </button>
          )}

          {currentUser && currentRole === "job_seeker" && (
            <button
              className="login-btn"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(false);
                setShowApplications(false);
                setShowRecruiterDashboard(false);
                setSelectedJobId(null);
                setShowResume(true);
              }}
            >
              My Resume
            </button>
          )}

          {currentUser && currentRole === "recruiter" && (
            <button
              className="login-btn"
              onClick={openRecruiterDashboard}
            >
              Recruiter Dashboard
            </button>
          )}

          {currentUser ? (
            <>
              <span className="company-name">
                Hi, {currentUser}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={openLogin}>
              Log In
            </button>
          )}

          <button className="signup-btn" onClick={openRegister}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Page content */}
      {showRegister ? (
        <Register
          onRegisterSuccess={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onBackToLogin={openLogin}
        />
      ) : showLogin ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setShowLogin(false)}
        />
      ) : showResume ? (
        <ResumeUpload
          onBack={() => setShowResume(false)}
        />
      ) : showRecruiterDashboard ? (
        <RecruiterDashboard
          onBack={() => setShowRecruiterDashboard(false)}
        />
      ) : showApplications ? (
        <MyApplications
          onBack={() => setShowApplications(false)}
        />
      ) : selectedJobId !== null ? (
        <JobDetails
          jobId={selectedJobId}
          onBack={() => setSelectedJobId(null)}
        />
      ) : (
        <main>
          {/* Hero Section */}
          <section className="hero" id="home">
            <div className="hero-content">
              <div className="eyebrow">
                YOUR NEXT CHAPTER STARTS HERE
              </div>

              <h1>
                Find work that
                <br />
                <span>moves you forward.</span>
              </h1>

              <p>
                Discover opportunities, connect with employers, and take
                the next step in your career with HireFlow.
              </p>

              <form
                className="search-box"
                onSubmit={(event) => {
                  event.preventDefault();

                  document.getElementById("jobs")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <div className="search-field">
                  <label htmlFor="keyword">WHAT</label>

                  <input
                    id="keyword"
                    type="text"
                    placeholder="Job title or skill"
                    value={keyword}
                    onChange={(event) =>
                      setKeyword(event.target.value)
                    }
                  />
                </div>

                <div className="search-divider" />

                <div className="search-field">
                  <label htmlFor="location">WHERE</label>

                  <input
                    id="location"
                    type="text"
                    placeholder="City or remote"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                  />
                </div>

                <button className="search-btn" type="submit">
                  Search Jobs
                </button>
              </form>

              <div className="popular-searches">
                <span>Popular:</span>

                {["Python", "React", "Developer"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setKeyword(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="hero-card">
                <div className="hero-card-top">
                  <div className="hero-icon">HF</div>
                  <span className="hiring-badge">HIRING NOW</span>
                </div>

                <p className="card-label">
                  YOUR NEXT OPPORTUNITY
                </p>

                <h2>
                  Great careers start with one connection.
                </h2>

                <div className="visual-divider" />

                <div className="visual-stat">
                  <div>
                    <strong>Better matches.</strong>
                    <p>Opportunities for your skills</p>
                  </div>

                  <span className="check-mark">✓</span>
                </div>

                <div className="visual-stat">
                  <div>
                    <strong>Real possibilities.</strong>
                    <p>Your next career milestone</p>
                  </div>

                  <span className="check-mark">✓</span>
                </div>
              </div>

              <div className="floating-card">
                <span className="floating-icon">↗</span>

                <div>
                  <strong>Your future, closer.</strong>
                  <p>Start exploring today</p>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="stats" id="about">
            <div>
              <strong>Discover</strong>
              <span>Opportunities that fit</span>
            </div>

            <div>
              <strong>Connect</strong>
              <span>With growing teams</span>
            </div>

            <div>
              <strong>Grow</strong>
              <span>Build your career</span>
            </div>
          </section>

          {/* Job Listings */}
          <section className="jobs-section" id="jobs">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  EXPLORE OPPORTUNITIES
                </span>

                <h2>
                  Featured <span>jobs.</span>
                </h2>

                <p>
                  Find a role that matches your ambition.
                </p>
              </div>

              {!loading && (
                <span className="job-count">
                  {filteredJobs.length} opportunities
                </span>
              )}
            </div>

            {loading ? (
              <div className="empty-state">
                <h3>Loading jobs...</h3>
                <p>Finding opportunities for you.</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <h3>Unable to load jobs</h3>
                <p>{error}</p>

                <button
                  className="signup-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="job-grid">
                {filteredJobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-top">
                      <div className="company-icon">
                        {(job.company_name || "H")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="job-type">
                        {(job.job_type || "Job").replace("_", " ")}
                      </span>
                    </div>

                    <h3>{job.title}</h3>

                    <p className="company-name">
                      {job.company_name}
                    </p>

                    <div className="job-meta">
                      <span>
                        📍 {job.location || "Location not specified"}
                      </span>

                      <span>
                        💰{" "}
                        {job.min_salary != null ||
                        job.max_salary != null
                          ? `₹${job.min_salary ?? "—"} – ₹${job.max_salary ?? "—"}`
                          : "Salary not specified"}
                      </span>
                    </div>

                    <p className="skills">
                      {job.required_skills || "Skills not specified"}
                    </p>

                    <button
                      className="apply-btn"
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      View Opportunity <span>↗</span>
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No matching jobs found</h3>

                <p>
                  {jobs.length === 0
                    ? "There are no published jobs yet."
                    : "Try another job title, skill, or location."}
                </p>

                {(keyword || location) && (
                  <button
                    className="signup-btn"
                    onClick={() => {
                      setKeyword("");
                      setLocation("");
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        <a className="logo footer-logo" href="#home" onClick={goHome}>
          Hire<span>Flow</span>
        </a>

        <p>Connecting talent with opportunity.</p>

        <span>
          © 2026 HireFlow. Built for your next chapter.
        </span>
      </footer>
    </div>
  );
}

export default App;