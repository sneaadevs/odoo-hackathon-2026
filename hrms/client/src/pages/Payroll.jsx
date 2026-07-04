import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function Payroll() {
  const { user } = useAuth();
  return user.role === "admin" ? <AdminPayroll /> : <EmployeePayroll />;
}

function EmployeePayroll() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/payroll/me").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Payroll</h2>
          <p>Your current salary structure. This is read-only.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <div className="card-title">Salary breakdown</div>
        {!data ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            <div className="payroll-figure">
              <span className="muted">Basic pay</span>
              <span className="amount">{money(data.salary.basic)}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Allowances</span>
              <span className="amount">{money(data.salary.allowances)}</span>
            </div>
            <div className="payroll-figure">
              <span className="muted">Deductions</span>
              <span className="amount">-{money(data.salary.deductions)}</span>
            </div>
            <div className="net-salary-box">
              <div className="label">Net salary / month</div>
              <div className="value">{money(data.netSalary)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminPayroll() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ basic: 0, allowances: 0, deductions: 0 });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    return api.get("/payroll").then((res) => setEmployees(res.data.employees));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  function openEdit(emp) {
    setEditTarget(emp);
    setForm({
      basic: emp.salary.basic,
      allowances: emp.salary.allowances,
      deductions: emp.salary.deductions,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/payroll/${editTarget._id}`, form);
      setEditTarget(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: 22 }}>Payroll management</h2>
          <p>Update salary structures across the team.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id}>
                    <td>
                      {e.name} <span className="muted mono">({e.employeeId})</span>
                    </td>
                    <td className="mono">{money(e.salary.basic)}</td>
                    <td className="mono">{money(e.salary.allowances)}</td>
                    <td className="mono">{money(e.salary.deductions)}</td>
                    <td className="mono">
                      {money(e.salary.basic + e.salary.allowances - e.salary.deductions)}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTarget && (
        <div className="modal-backdrop" onClick={() => setEditTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit salary</h3>
            <p className="subtitle">{editTarget.name}</p>
            <form onSubmit={handleSave}>
              <div className="field">
                <label htmlFor="basic">Basic pay</label>
                <input
                  id="basic"
                  type="number"
                  min="0"
                  value={form.basic}
                  onChange={(e) => setForm({ ...form, basic: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="allowances">Allowances</label>
                <input
                  id="allowances"
                  type="number"
                  min="0"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="deductions">Deductions</label>
                <input
                  id="deductions"
                  type="number"
                  min="0"
                  value={form.deductions}
                  onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
