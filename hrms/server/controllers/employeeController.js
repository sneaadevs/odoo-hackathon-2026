const User = require("../models/User");

// @route GET /api/employees  (admin only)
async function getEmployees(req, res) {
  const employees = await User.find().sort({ createdAt: -1 });
  res.json({ employees });
}

// @route GET /api/employees/:id  (self or admin)
async function getEmployeeById(req, res) {
  const { id } = req.params;

  if (req.user.role !== "admin" && req.user._id.toString() !== id) {
    return res.status(403).json({ message: "You can only view your own profile" });
  }

  const employee = await User.findById(id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  res.json({ employee });
}

// @route PUT /api/employees/:id  (self: limited fields, admin: all fields)
async function updateEmployee(req, res) {
  const { id } = req.params;
  const isSelf = req.user._id.toString() === id;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: "You can only edit your own profile" });
  }

  const employee = await User.findById(id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  if (isAdmin) {
    const { name, phone, address, department, designation, role, dateOfJoining } = req.body;
    if (name !== undefined) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (role !== undefined) employee.role = role;
    if (dateOfJoining !== undefined) employee.dateOfJoining = dateOfJoining;
  } else {
    // Employees may only edit their own contact details, per spec.
    const { phone, address } = req.body;
    if (phone !== undefined) employee.phone = phone;
    if (address !== undefined) employee.address = address;
  }

  await employee.save();
  res.json({ employee });
}

module.exports = { getEmployees, getEmployeeById, updateEmployee };
