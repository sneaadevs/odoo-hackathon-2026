import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import WeekStrip from "../components/WeekStrip";
import StatusBadge from "../components/StatusBadge";
import { ClockIcon } from "../components/icons";

function fmtTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Attendance() {
  const { user } = useAuth();
  return user.role === "admin" ? <AdminAttendance /> : <EmployeeAttendance />;
}

function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === today);

  async function load() {
    const res = await api.get("/attendance/me");
    setRecords(res.data.records);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function handleCheckIn() {
    setBusy(true);
    setError("");
    try {
      await api.post("/attendance/checkin");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not check in.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    setError("");
    try {
      await api.post("/attendance/checkout");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not check out.");
    } finally {
      setBusy(false);
    }
  }

  const statusByDate = Object.fromEntries(records.map((r) => [r.date, r.status]));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Attendance</h2>
          <p>Check in and out, and review your history.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Today</div>
        {error && <div className="form-error">{error}</div>}
        <div className="check-panel">
          <div>
            <div className="status-line">
              Check-in: <span className="time">{fmtTime(todayRecord?.checkInTime)}</span> &nbsp;&middot;&nbsp;
              Check-out: <span className="time">{fmtTime(todayRecord?.checkOutTime)}</span>
            </div>
            {todayRecord && (
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={todayRecord.status} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={handleCheckIn}
              disabled={busy || !!todayRecord}
            >
              <ClockIcon /> Check in
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleCheckOut}
              disabled={busy || !todayRecord || !!todayRecord?.checkOutTime}
            >
              Check out
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">This week</div>
        <WeekStrip statusByDate={statusByDate} onLight />
      </div>

      <div className="card">
        <div className="card-title">History</div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>No attendance recorded yet. Check in above to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date}</td>
                    <td className="mono">{fmtTime(r.checkInTime)}</td>
                    <td className="mono">{fmtTime(r.checkOutTime)}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAttendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data.employees));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (employeeFilter) params.employee = employeeFilter;
    if (dateFilter) params.date = dateFilter;
    api
      .get("/attendance", { params })
      .then((res) => setRecords(res.data.records))
      .finally(() => setLoading(false));
  }, [employeeFilter, dateFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Attendance records</h2>
          <p>View check-in activity across your team.</p>
        </div>
      </div>

      <div className="card">
        <div className="field-row">
          <div className="field">
            <label htmlFor="employeeFilter">Employee</label>
            <select
              id="employeeFilter"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="">All employees</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dateFilter">Date</label>
            <input
              id="dateFilter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>No attendance records match this filter.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.employee?.name} <span className="muted mono">({r.employee?.employeeId})</span>
                    </td>
                    <td>{r.date}</td>
                    <td className="mono">{fmtTime(r.checkInTime)}</td>
                    <td className="mono">{fmtTime(r.checkOutTime)}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
