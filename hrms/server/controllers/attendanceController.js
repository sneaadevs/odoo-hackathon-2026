const Attendance = require("../models/Attendance");

function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// @route POST /api/attendance/checkin
async function checkIn(req, res) {
  const date = todayString();

  const existing = await Attendance.findOne({ employee: req.user._id, date });
  if (existing) {
    return res.status(409).json({ message: "You have already checked in today" });
  }

  const record = await Attendance.create({
    employee: req.user._id,
    date,
    checkInTime: new Date(),
    status: "Present",
  });

  res.status(201).json({ record });
}

// @route POST /api/attendance/checkout
async function checkOut(req, res) {
  const date = todayString();

  const record = await Attendance.findOne({ employee: req.user._id, date });
  if (!record) {
    return res.status(400).json({ message: "You need to check in before checking out" });
  }
  if (record.checkOutTime) {
    return res.status(409).json({ message: "You have already checked out today" });
  }

  record.checkOutTime = new Date();

  // Simple half-day heuristic: less than 4 hours between check-in and
  // check-out counts as a half day.
  const hoursWorked = (record.checkOutTime - record.checkInTime) / (1000 * 60 * 60);
  if (hoursWorked < 4) {
    record.status = "Half-day";
  }

  await record.save();
  res.json({ record });
}

// @route GET /api/attendance/me
async function getMyAttendance(req, res) {
  const records = await Attendance.find({ employee: req.user._id }).sort({ date: -1 });
  res.json({ records });
}

// @route GET /api/attendance  (admin only) ?employee=<id>&date=<YYYY-MM-DD>
async function getAllAttendance(req, res) {
  const filter = {};
  if (req.query.employee) filter.employee = req.query.employee;
  if (req.query.date) filter.date = req.query.date;

  const records = await Attendance.find(filter)
    .populate("employee", "name employeeId department")
    .sort({ date: -1 });

  res.json({ records });
}

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance };
