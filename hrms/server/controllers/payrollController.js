const User = require("../models/User");

// @route GET /api/payroll/me
async function getMyPayroll(req, res) {
  const user = await User.findById(req.user._id);
  res.json({
    salary: user.salary,
    netSalary: user.netSalary,
  });
}

// @route GET /api/payroll  (admin only)
async function getAllPayroll(req, res) {
  const employees = await User.find().select("name employeeId department designation salary");
  res.json({ employees });
}

// @route PUT /api/payroll/:id  (admin only)
async function updatePayroll(req, res) {
  const { basic, allowances, deductions } = req.body;

  const employee = await User.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  if (basic !== undefined) employee.salary.basic = Number(basic);
  if (allowances !== undefined) employee.salary.allowances = Number(allowances);
  if (deductions !== undefined) employee.salary.deductions = Number(deductions);

  await employee.save();
  res.json({ employee });
}

module.exports = { getMyPayroll, getAllPayroll, updatePayroll };
