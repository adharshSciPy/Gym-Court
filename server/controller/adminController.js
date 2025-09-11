import { Admin } from "../model/adminSchema.js";
import { passwordValidator } from "../utils/passwordValidator.js";
import { emailValidator } from "../utils/emailValidator.js";
// import jwt from "jsonwebtoken";

const registerAdmin = async (req, res) => {
  const { phoneNumber, password, userName, adminEmail } = req.body;

  try {
    if (!phoneNumber || !password || !userName || !adminEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailValidator(adminEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!passwordValidator(password)) {
      return res.status(400).json({
        message:
          "Password must be 8–64 characters long, include uppercase, lowercase, number, and special character.",
      });
    }
    const existingAdmin = await Admin.findOne({ adminEmail });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const admin = await Admin.create({
      phoneNumber,
      password,
      userName,
      adminEmail,
    });
    const createdAdmin = await Admin.findById(admin._id).select("-password");
    if (!createdAdmin) {
      return res.status(500).json({ message: "Admin registration failed" });
    }

    res.status(201).json({
      message: "Admin registered successfully",
      data: createdAdmin,
      token:token
    });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    return res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
};
const adminLogin = async (req, res) => {
  const { adminEmail, password } = req.body;

  try {
    if (!adminEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ adminEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await admin.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = admin.generateAccessToken();

    res.status(200).json({
      message: "Login successful",
      token,
      role: admin.role,
      adminId: admin._id,
      adminEmail: admin.adminEmail,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export { registerAdmin ,adminLogin};
