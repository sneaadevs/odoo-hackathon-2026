const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    employeeId: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ["employee", "admin"], default: "employee" },

    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    department: { type: String, default: "General" },
    designation: { type: String, default: "Employee" },
    dateOfJoining: { type: Date, default: Date.now },

    // Simplification for MVP: no file upload, just a color used to render
    // an initials avatar on the frontend.
    avatarColor: { type: String, default: "#1F7A5C" },

    // Simplification for MVP: email verification is marked true on
    // signup instead of sending a real verification email.
    isEmailVerified: { type: Boolean, default: true },

    salary: {
      basic: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.virtual("netSalary").get(function () {
  return (this.salary?.basic || 0) + (this.salary?.allowances || 0) - (this.salary?.deductions || 0);
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
