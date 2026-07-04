const Leave = require("../models/Leave");

// @route POST /api/leave
async function applyLeave(req, res) {
  const { leaveType, startDate, endDate, remarks } = req.body;

  if (!leaveType || !startDate || !endDate) {
    return res.status(400).json({ message: "Leave type, start date and end date are required" });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: "Start date must be before or equal to end date" });
  }

  const leave = await Leave.create({
    employee: req.user._id,
    leaveType,
    startDate,
    endDate,
    remarks: remarks || "",
  });

  res.status(201).json({ leave });
}

// @route GET /api/leave/me
async function getMyLeaves(req, res) {
  const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json({ leaves });
}

// @route GET /api/leave  (admin only) ?status=Pending
async function getAllLeaves(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const leaves = await Leave.find(filter)
    .populate("employee", "name employeeId department")
    .sort({ createdAt: -1 });

  res.json({ leaves });
}

// @route PUT /api/leave/:id  (admin only)
async function reviewLeave(req, res) {
  const { status, adminComment } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave request not found" });

  leave.status = status;
  leave.adminComment = adminComment || "";
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();

  await leave.save();
  res.json({ leave });
}

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
