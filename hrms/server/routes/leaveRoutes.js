const express = require("express");
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require("../controllers/leaveController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", applyLeave);
router.get("/me", getMyLeaves);
router.get("/", adminOnly, getAllLeaves);
router.put("/:id", adminOnly, reviewLeave);

module.exports = router;
