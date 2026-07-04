const express = require("express");
const { getMyPayroll, getAllPayroll, updatePayroll } = require("../controllers/payrollController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/me", getMyPayroll);
router.get("/", adminOnly, getAllPayroll);
router.put("/:id", adminOnly, updatePayroll);

module.exports = router;
