import { Receptionist } from "../model/receptionistSchema.js"
import { passwordValidator } from "../utils/passwordValidator.js";
import { emailValidator } from "../utils/emailValidator.js";
import mongoose from "mongoose";

// Register
const registerReceptionist = async (req, res) => {
  const { phoneNumber, password, userName, receptionistEmail } = req.body;

  try {
    if (!phoneNumber || !password || !userName || !receptionistEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailValidator(receptionistEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!passwordValidator(password)) {
      return res.status(400).json({
        message:
          "Password must be 8–64 characters long, include uppercase, lowercase, number, and special character.",
      });
    }

    const existingReceptionist = await Receptionist.findOne({ receptionistEmail });
    if (existingReceptionist) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const receptionist = await Receptionist.create({
      phoneNumber,
      password,
      userName,
      receptionistEmail,
    });

    const createdReceptionist = await Receptionist.findById(receptionist._id).select("-password");
    if (!createdReceptionist) {
      return res.status(500).json({ message: "Receptionist registration failed" });
    }

    res.status(201).json({
      message: "Receptionist registered successfully",
      data: createdReceptionist,
    });
  } catch (error) {
    console.error("Receptionist Registration Error:", error);
    return res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
};

// Login
const receptionistLogin = async (req, res) => {
  const { receptionistEmail, password } = req.body;

  try {
    if (!receptionistEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const receptionist = await Receptionist.findOne({ receptionistEmail });
    if (!receptionist) {
      return res.status(404).json({ message: "Receptionist not found" });
    }

    const isMatch = await receptionist.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = receptionist.generateAccessToken();

    res.status(200).json({
      message: "Login successful",
      token,
      role: receptionist.role,
      receptionistId: receptionist._id,
      receptionistEmail: receptionist.receptionistEmail,
    });
  } catch (error) {
    console.error("Receptionist Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
 const getAllReceptionists = async (req, res) => {
  try {
    const receptionists = await Receptionist.find().select('-password'); 
    if (!receptionists || receptionists.length === 0) {
      return res.status(404).json({ message: "No receptionists found" });
    }
    res.status(200).json({ message: "Receptionists fetched successfully",count:receptionists.length, receptionists });
  } catch (error) {
    console.error("Error fetching receptionists:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message});
  }
};
const deleteReceptionist = async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Receptionist ID" });
  }

  try {
    const receptionist = await Receptionist.findById(id);
    if (!receptionist) {
      return res.status(404).json({ message: "Receptionist not found" });
    }
    await Receptionist.findByIdAndDelete(id);

    res.status(200).json({ message: "Receptionist deleted successfully" });
  } catch (error) {
    console.error("Error deleting receptionist:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export { registerReceptionist, receptionistLogin,getAllReceptionists ,deleteReceptionist};
