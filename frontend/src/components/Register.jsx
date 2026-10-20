import { useState } from "react";
import api from "../api/axiosConfig";
import "./Register.css";

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register/", {
  username: username.trim(),
  email: email.trim(),
  password,
  password2: confirmPassword,
  first_name: fullName.trim(),
  role: "job_seeker",
});
      setSuccess(
        response.data?.message ||
          "Account created successfully! You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      // Show the login page after a short delay.
      setTimeout(() => {
        onRegisterSuccess?.({
          username: username.trim(),
        });
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const details = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : "";

            return details ? `${field}: ${details}` : "";
          })
          .filter(Boolean);

        setError(
          messages.length
            ? messages.join(" ")
            : "Registration failed. Please check your details."
        );
      } else {
        setError(
          "Unable to register. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-brand">
          Hire<span>Flow</span>
        </div>

        <h1>Create your account</h1>

        <p className="register-subtitle">
          Start your next career journey with HireFlow.
        </p>

        <form onSubmit={handleRegister}>
          <div className="register-field">
            <label htmlFor="register-fullname">Full Name</label>

            <input
              id="register-fullname"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-username">Username</label>

            <input
              id="register-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-email">Email Address</label>

            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="register-field">
            <label htmlFor="register-confirm-password">
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="register-success" role="status">
              {success}
            </p>
          )}

          <button
            className="register-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-login-text">
          Already have an account?{" "}
          <button
            type="button"
            className="register-login-link"
            onClick={onBackToLogin}
          >
            Log In
          </button>
        </p>

        <p className="register-role-note">
          Registration creates a job seeker account.
        </p>
      </section>
    </main>
  );
}

export default Register;