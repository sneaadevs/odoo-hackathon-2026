import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { PeopleIcon, ClockIcon, CalendarIcon } from "../components/icons";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      api.get("/employees"),
      api.get("/attendance", { params: { date: today } }),
      api.get("/leave", { params: { status: "Pending" } }),
    ])
      .then(([empRes, attRes, leaveRes]) => {
        setEmployees(empRes.data.employees);
        setTodayAttendance(attRes.data.records);
        setPendingLeaves(leaveRes.data.leaves);
      })
      .finally(() => setLoading(false));
  }, []);

  const employeeCount = employees.filter((e) => e.role === "employee").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>HR overview</h2>
          <p>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="grid cols-3">
        <div className="card stat-card">
          <div className="label">Total employees</div>
          <div className="value">{loading ? "-" : employeeCount}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Present today</div>
          <div className="value">{loading ? "-" : todayAttendance.length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Pending leave requests</div>
          <div className="value">{loading ? "-" : pendingLeaves.length}</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Employees</div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : employees.length === 0 ? (
            <p className="muted">No employees yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 6).map((e) => (
                    <tr key={e._id}>
                      <td>{e.name}</td>
                      <td className="mono">{e.employeeId}</td>
                      <td>{e.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link to="/attendance" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
            <PeopleIcon /> View attendance records
          </Link>
        </div>

        <div className="card">
          <div className="card-title">Pending leave approvals</div>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : pendingLeaves.length === 0 ? (
            <p className="muted">Nothing waiting on you right now.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.slice(0, 6).map((l) => (
                    <tr key={l._id}>
                      <td>{l.employee?.name}</td>
                      <td>{l.leaveType}</td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link to="/leave" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>
            <CalendarIcon /> Review all leave requests
          </Link>
        </div>
      </div>
    </div>
  );
}
