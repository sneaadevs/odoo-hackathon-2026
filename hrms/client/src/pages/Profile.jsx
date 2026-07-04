import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AVATAR_COLORS = ["#1F7A5C", "#C98A1A", "#B14A3B", "#3B5CB8", "#7A4FB5"];

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({ phone: user?.phone || "", address: user?.address || "" });
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await api.put(`/employees/${user._id}`, { ...form, avatarColor });
      updateLocalUser(res.data.employee);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Your profile</h2>
          <p>Personal details, job details, and account info.</p>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Personal details</div>
          <div
            className="avatar"
            style={{ width: 56, height: 56, fontSize: 20, background: avatarColor, marginBottom: 14 }}
          >
            {initials(user?.name)}
          </div>

          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="field">
              <label>Full name</label>
              <input value={user?.name || ""} disabled />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user?.email || ""} disabled />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Add a phone number"
              />
            </div>
            <div className="field">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Add your address"
              />
            </div>
            <div className="field">
              <label>Avatar color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {AVATAR_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: c === avatarColor ? "2px solid var(--ink)" : "2px solid transparent",
                      padding: 0,
                    }}
                    aria-label={`Choose ${c}`}
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Job details</div>
            <div className="payroll-figure">
              <span className="muted">Employee ID</span>
              <span className="mono">{user?.employeeId}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Role</span>
              <span style={{ textTransform: "capitalize" }}>{user?.role}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Department</span>
              <span>{user?.department}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Designation</span>
              <span>{user?.designation}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Date of joining</span>
              <span>{user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : "-"}</span>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Documents</div>
            <p className="muted" style={{ fontSize: 13.5 }}>
              Document uploads aren't part of this MVP build. This is a good next feature to add.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
