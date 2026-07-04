# HRMS — Human Resource Management System

A MERN-stack HRMS built for the hackathon problem statement: authentication with
role-based access, employee profiles, attendance tracking, leave management,
and payroll visibility.

**Stack:** React (Vite) · Node.js / Express · MongoDB (Mongoose) · JWT auth

---

## 1. Quick start

You'll need [Node.js 18+](https://nodejs.org) and a MongoDB connection string
(a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine, or
a local `mongod`).

### Backend

```bash
cd server
cp .env.example .env      # then edit .env with your MongoDB URI + JWT secret
npm install
npm run seed               # optional: creates demo admin + employees
npm run dev                 # starts the API on http://localhost:5000
```

### Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` requests to
the backend, so no extra CORS setup is needed in development.

### Demo logins (after running `npm run seed`)

| Role     | Email             | Password      |
|----------|-------------------|---------------|
| Admin/HR | admin@hrms.com    | admin123      |
| Employee | arjun@hrms.com    | employee123   |
| Employee | sara@hrms.com     | employee123   |

Or just sign up your own account from `/signup` and pick "Employee" or "HR / Admin".

---

## 2. Feature checklist (mapped to the problem statement)

- [x] Sign up with employee ID, email, password, role selection
- [x] Sign in with error handling on bad credentials, JWT-based sessions
- [x] Role-based dashboards (Employee vs Admin/HR)
- [x] Employee dashboard: quick-access cards, recent leave activity
- [x] Admin dashboard: employee list, today's attendance count, pending leave approvals
- [x] Profile view (personal, job, salary details) and edit (self: contact info; admin: full record)
- [x] Attendance check-in / check-out with Present / Half-day status
- [x] Attendance history (self) and all-employee view with filters (admin)
- [x] Leave application (type, date range, remarks) with Pending/Approved/Rejected status
- [x] Admin leave approval/rejection with comments
- [x] Payroll: read-only view for employees, full edit control for admin

### Known simplifications (called out for transparency, given the time box)

- **Email verification** is auto-marked true on sign-up rather than sending a real
  verification email — no mail service is wired up.
- **Profile picture / documents**: no file upload. Profiles use a color-coded
  initials avatar instead; a documents tab is stubbed but not implemented.
- **Leave date selection** uses two date inputs rather than a drag-select
  calendar widget, to keep the dependency footprint small.
- **Date handling** uses UTC calendar dates consistently across frontend and
  backend. For employees far from UTC, the "day" can roll over a few hours
  off from local midnight — fine for a demo, worth revisiting for production.
- Passwords are hashed with bcrypt and routes are protected with JWT + role
  checks, but this hasn't had a security audit — don't use these exact secrets
  in production.

These are good callouts for a "future work" slide if your hackathon judging
includes a Q&A.

---

## 3. Project structure

```
hrms/
├── server/                 # Express API
│   ├── config/db.js
│   ├── models/              # User, Attendance, Leave (payroll lives on User)
│   ├── middleware/auth.js   # JWT verification + admin-only guard
│   ├── controllers/
│   ├── routes/
│   ├── seed.js               # demo data
│   └── server.js
└── client/                  # React (Vite) app
    └── src/
        ├── api/axios.js      # axios instance + auth header interceptor
        ├── context/AuthContext.jsx
        ├── components/       # Sidebar, Topbar, WeekStrip, StatusBadge, icons...
        └── pages/             # Login, Signup, Dashboards, Profile, Attendance, Leave, Payroll
```

## 4. API overview

| Method | Route                  | Access        | Purpose                          |
|--------|-------------------------|---------------|-----------------------------------|
| POST   | `/api/auth/register`    | public        | Sign up                           |
| POST   | `/api/auth/login`       | public        | Sign in                           |
| GET    | `/api/auth/me`          | authenticated | Current user                      |
| GET    | `/api/employees`        | admin         | List all employees                |
| GET    | `/api/employees/:id`    | self or admin | View a profile                    |
| PUT    | `/api/employees/:id`    | self or admin | Edit a profile                    |
| POST   | `/api/attendance/checkin`  | authenticated | Check in for today            |
| POST   | `/api/attendance/checkout` | authenticated | Check out for today           |
| GET    | `/api/attendance/me`    | authenticated | Own attendance history            |
| GET    | `/api/attendance`       | admin         | All attendance (filter by employee/date) |
| POST   | `/api/leave`             | authenticated | Apply for leave                   |
| GET    | `/api/leave/me`          | authenticated | Own leave requests                |
| GET    | `/api/leave`             | admin         | All leave requests (filter by status) |
| PUT    | `/api/leave/:id`         | admin         | Approve/reject a leave request    |
| GET    | `/api/payroll/me`        | authenticated | Own salary breakdown              |
| GET    | `/api/payroll`           | admin         | All employees' salary              |
| PUT    | `/api/payroll/:id`       | admin         | Update an employee's salary        |

## 5. Pushing to your GitHub repo

```bash
cd hrms
git init
git add .
git commit -m "HRMS MVP: auth, attendance, leave, payroll"
git branch -M main
git remote add origin <your-empty-repo-url>
git push -u origin main
```

Remember to **not** commit `server/.env` — it's already in `.gitignore`.
