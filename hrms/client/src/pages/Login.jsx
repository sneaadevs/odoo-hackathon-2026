import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WeekStrip from "../components/WeekStrip";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="brand">
          HR<span>MS</span>
        </div>
        <div className="pitch">
          <h1>Every workday, perfectly aligned.</h1>
          <p>Attendance, leave, and payroll in one place &mdash; for employees and HR alike.</p>
          <div style={{ marginTop: 28 }}>
            <WeekStrip
              statusByDate={{}}
              onLight={false}
            />
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#7d879b" }}>HRMS Demo &middot; Built for the hackathon</p>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="mobile-brand">
            HR<span>MS</span>
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your HRMS account.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
