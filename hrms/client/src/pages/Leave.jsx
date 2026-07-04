import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function Leave() {
  const { user } = useAuth();
  return user.role === "admin" ? <AdminLeave /> : <EmployeeLeave />;
}

function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType: "Paid", startDate: "", endDate: "", remarks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function load() {
    return api.get("/leave/me").then((res) => setLeaves(res.data.leaves));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await api.post("/leave", form);
      setMessage("Leave request submitted.");
      setForm({ leaveType: "Paid", startDate: "", endDate: "", remarks: "" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Leave & time-off</h2>
          <p>Apply for leave and track its approval status.</p>
        </div>
      </div>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Apply for leave</div>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="leaveType">Leave type</label>
              <select
                id="leaveType"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              >
                <option value="Paid">Paid</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="startDate">Start date</label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="endDate">End date</label>
                <input
                  id="endDate"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="remarks">Remarks</label>
              <textarea
                id="remarks"
                placeholder="Add any context for your HR officer"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">Your requests</div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <p>No leave requests yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l._id}>
                      <td>{l.leaveType}</td>
                      <td>
                        {l.startDate} &rarr; {l.endDate}
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                        {l.adminComment && (
                          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                            "{l.adminComment}"
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminLeave() {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null); // { leave, status }
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    return api.get("/leave", { params }).then((res) => setLeaves(res.data.leaves));
  }

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [statusFilter]);

  function openReview(leave, status) {
    setReviewTarget({ leave, status });
    setComment("");
  }

  async function confirmReview() {
    setSubmitting(true);
    try {
      await api.put(`/leave/${reviewTarget.leave._id}`, {
        status: reviewTarget.status,
        adminComment: comment,
      });
      setReviewTarget(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Leave approvals</h2>
          <p>Review and respond to time-off requests.</p>
        </div>
      </div>

      <div className="card">
        <div className="field" style={{ maxWidth: 220 }}>
          <label htmlFor="statusFilter">Filter by status</label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <p>No leave requests match this filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      {l.employee?.name} <span className="muted mono">({l.employee?.employeeId})</span>
                    </td>
                    <td>{l.leaveType}</td>
                    <td>
                      {l.startDate} &rarr; {l.endDate}
                    </td>
                    <td className="muted">{l.remarks || "-"}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td>
                      {l.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => openReview(l, "Approved")}>
                            Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => openReview(l, "Rejected")}>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewTarget && (
        <div className="modal-backdrop" onClick={() => setReviewTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{reviewTarget.status === "Approved" ? "Approve" : "Reject"} leave request</h3>
            <p className="subtitle">
              {reviewTarget.leave.employee?.name} &middot; {reviewTarget.leave.leaveType} &middot;{" "}
              {reviewTarget.leave.startDate} &rarr; {reviewTarget.leave.endDate}
            </p>
            <div className="field">
              <label htmlFor="comment">Comment (optional)</label>
              <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setReviewTarget(null)}>
                Cancel
              </button>
              <button
                className={reviewTarget.status === "Approved" ? "btn btn-primary" : "btn btn-danger"}
                onClick={confirmReview}
                disabled={submitting}
              >
                {submitting ? "Saving..." : `Confirm ${reviewTarget.status.toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
