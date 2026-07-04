const express = require("express");
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/me", getMyAttendance);
router.get("/", adminOnly, getAllAttendance);

module.exports = router;
