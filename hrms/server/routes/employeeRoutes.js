const express = require("express");
const { getEmployees, getEmployeeById, updateEmployee } = require("../controllers/employeeController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", adminOnly, getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);

module.exports = router;
