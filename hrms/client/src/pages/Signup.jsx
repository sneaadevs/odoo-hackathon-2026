import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    password: "",
    role: "employee",
  });
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
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create your account. Please try again.");
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
          <p>Set up your account to track attendance, request leave, and view your payroll.</p>
        </div>
        <p style={{ fontSize: 13, color: "#7d879b" }}>HRMS Demo &middot; Built for the hackathon</p>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="mobile-brand">
            HR<span>MS</span>
          </div>
          <h2>Create your account</h2>
          <p className="subtitle">Join as an employee or an HR officer.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  id="employeeId"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="EMP101"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="employee">Employee</option>
                  <option value="admin">HR / Admin</option>
                </select>
              </div>
            </div>
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
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
