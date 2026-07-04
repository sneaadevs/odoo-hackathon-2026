// Populates the database with a demo admin, a few employees, and sample
// attendance/leave records so the app has something to show immediately.
// Run with: npm run seed  (inside the server folder)
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Attendance.deleteMany({}), Leave.deleteMany({})]);

  console.log("Creating users...");
  const admin = await User.create({
    name: "Priya Sharma",
    email: "admin@hrms.com",
    password: "admin123",
    employeeId: "HR001",
    role: "admin",
    department: "Human Resources",
    designation: "HR Manager",
    salary: { basic: 90000, allowances: 15000, deductions: 8000 },
  });

  const employees = await User.create([
    {
      name: "Arjun Mehta",
      email: "arjun@hrms.com",
      password: "employee123",
      employeeId: "EMP001",
      role: "employee",
      department: "Engineering",
      designation: "Software Engineer",
      phone: "9876543210",
      address: "Bangalore, India",
      salary: { basic: 60000, allowances: 10000, deductions: 5000 },
    },
    {
      name: "Sara Khan",
      email: "sara@hrms.com",
      password: "employee123",
      employeeId: "EMP002",
      role: "employee",
      department: "Design",
      designation: "UI/UX Designer",
      phone: "9876500000",
      address: "Pune, India",
      salary: { basic: 55000, allowances: 8000, deductions: 4000 },
    },
  ]);

  console.log("Creating attendance history...");
  const attendanceDocs = [];
  for (const emp of employees) {
    for (let i = 1; i <= 5; i++) {
      attendanceDocs.push({
        employee: emp._id,
        date: dateStr(i),
        checkInTime: new Date(Date.now() - i * 86400000),
        checkOutTime: new Date(Date.now() - i * 86400000 + 8 * 3600000),
        status: "Present",
      });
    }
  }
  await Attendance.insertMany(attendanceDocs);

  console.log("Creating leave requests...");
  await Leave.create([
    {
      employee: employees[0]._id,
      leaveType: "Sick",
      startDate: dateStr(2),
      endDate: dateStr(1),
      remarks: "Fever, resting at home",
      status: "Pending",
    },
    {
      employee: employees[1]._id,
      leaveType: "Paid",
      startDate: dateStr(10),
      endDate: dateStr(8),
      remarks: "Family trip",
      status: "Approved",
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    },
  ]);

  console.log("\nSeed complete. Demo logins:");
  console.log("  Admin:    admin@hrms.com / admin123");
  console.log("  Employee: arjun@hrms.com / employee123");
  console.log("  Employee: sara@hrms.com  / employee123\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
