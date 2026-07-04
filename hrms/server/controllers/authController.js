const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const AVATAR_COLORS = ["#1F7A5C", "#C98A1A", "#B14A3B", "#3B5CB8", "#7A4FB5"];

function pickAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// @route POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, employeeId, role } = req.body;

    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: "Name, email, employee ID and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(409).json({ message: "This employee ID is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      role: role === "admin" ? "admin" : "employee",
      avatarColor: pickAvatarColor(),
    });

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

// @route POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// @route GET /api/auth/me
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
