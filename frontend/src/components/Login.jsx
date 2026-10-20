import { useState } from "react";
import api from "../api/axiosConfig";

function Login({ onLoginSuccess, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login/", {
        username,
        password,
      });

      const token = response.data.token;

      if (!token) {
        setError("Login failed: the server did not return a token.");
        return;
      }

      localStorage.setItem("token", token);

      onLoginSuccess(response.data);
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="details-page">
      <button className="details-back" onClick={onBack}>
        ← Back
      </button>

      <section className="details-card">
        <h1>Welcome Back!</h1>
        <p>Log in to your HireFlow account.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="login-username">Username</label>

          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" style={{ color: "crimson" }}>
              {error}
            </p>
          )}

          <button
            className="details-apply"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;