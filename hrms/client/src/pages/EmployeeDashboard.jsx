import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import WeekStrip from "../components/WeekStrip";
import StatusBadge from "../components/StatusBadge";
import { UserIcon, ClockIcon, CalendarIcon } from "../components/icons";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/attendance/me"), api.get("/leave/me")])
      .then(([attRes, leaveRes]) => {
        setAttendance(attRes.data.records);
        setLeaves(leaveRes.data.leaves);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusByDate = Object.fromEntries(attendance.map((r) => [r.date, r.status]));
  const todayRecord = attendance.find((r) => r.date === new Date().toISOString().slice(0, 10));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Hi {user?.name?.split(" ")[0]}, here's your week</h2>
          <p>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">This week's attendance</div>
        <WeekStrip statusByDate={statusByDate} onLight />
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          {todayRecord
            ? `Today: ${todayRecord.status}${todayRecord.checkOutTime ? " · checked out" : " · checked in"}`
            : "You haven't checked in today yet."}
        </p>
      </div>

      <div className="grid cols-3" style={{ marginTop: 16 }}>
        <Link to="/profile" className="card quick-card">
          <div className="icon-badge">
            <UserIcon />
          </div>
          <div className="title">Profile</div>
          <div className="desc">View and edit your details</div>
        </Link>
        <Link to="/attendance" className="card quick-card">
          <div className="icon-badge">
            <ClockIcon />
          </div>
          <div className="title">Attendance</div>
          <div className="desc">Check in, check out, view history</div>
        </Link>
        <Link to="/leave" className="card quick-card">
          <div className="icon-badge">
            <CalendarIcon />
          </div>
          <div className="title">Leave requests</div>
          <div className="desc">Apply and track approvals</div>
        </Link>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Recent leave activity</div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="muted">No leave requests yet.</p>
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
                {leaves.slice(0, 4).map((l) => (
                  <tr key={l._id}>
                    <td>{l.leaveType}</td>
                    <td>
                      {l.startDate} &rarr; {l.endDate}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
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
