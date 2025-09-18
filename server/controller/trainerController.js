import { Trainer } from "../model/trainerSchema.js";
import { Gym } from "../model/gymSchema.js";
import { GymUsers } from "../model/gymUserSchema.js";
import { passwordValidator } from "../utils/passwordValidator.js";
import { emailValidator } from "../utils/emailValidator.js";
import mongoose from "mongoose";

// Register Trainer
const registerTrainer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // start transaction

  try {
    const { phoneNumber, password, trainerName, trainerEmail, experience } = req.body;

    if (!phoneNumber || !password || !trainerName || !trainerEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailValidator(trainerEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!passwordValidator(password)) {
      return res.status(400).json({
        message:
          "Password must be 8–64 characters long, include uppercase, lowercase, number, and special character.",
      });
    }

    // Check if trainer exists
    const existingTrainer = await Trainer.findOne({
      $or: [{ trainerEmail }, { phoneNumber }],
    }).session(session);
    if (existingTrainer) {
      return res.status(409).json({ message: "Email or phone number already in use" });
    }

    // Create trainer
    const trainer = await Trainer.create(
      [
        {
          phoneNumber,
          password,
          trainerName,
          trainerEmail,
          experience: experience || 0,
        },
      ],
      { session }
    );

    // Fetch the single gym
    const gym = await Gym.findOne().session(session);
    if (!gym) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No gym found in the system" });
    }

    // Add trainer to gym if not already added
    if (!gym.trainers.includes(trainer[0]._id)) {
      gym.trainers.push(trainer[0]._id);
      await gym.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Return trainer without password
    const createdTrainer = await Trainer.findById(trainer[0]._id).select("-password");

    res.status(201).json({
      message: "Trainer registered successfully and added to the gym",
      data: createdTrainer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Trainer Registration Error:", error);
    return res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
};

// Login Trainer
const trainerLogin = async (req, res) => {
  const { trainerEmail, password } = req.body;

  try {
    if (!trainerEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trainer = await Trainer.findOne({ trainerEmail });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const isMatch = await trainer.isPasswordCorrect(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = trainer.generateAccessToken();

    res.status(200).json({
      message: "Login successful",
      token,
      role: trainer.role,
      trainerId: trainer._id,
      trainerEmail: trainer.trainerEmail,
    });
  } catch (error) {
    console.error("Trainer Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get all trainers with assigned users count
const getAllTrainers = async (req, res) => {
  try {

    const trainers = await Trainer.find()
      .populate("users", "firstName lastName phoneNumber") 
      .lean();
    const trainersWithCounts = trainers.map((trainer) => ({
      ...trainer,
      assignedUserCount: trainer.users ? trainer.users.length : 0,
    }));

    res.status(200).json({
      message: "Trainers fetched successfully",
      count: trainersWithCounts.length,
      trainers: trainersWithCounts,
    });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
 const deleteTrainer = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Trainer ID" });
  }

  try {

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    await GymUsers.updateMany(
      { trainer: id },
      { $pull: { trainer: id } } 
    );
    await Trainer.findByIdAndDelete(id);

    res.status(200).json({ message: "Trainer deleted successfully and users released" });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
const assignDietPlan = async (req, res) => {
  try {
    const {id:trainerId }= req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Diet PDF is required" });
    }

    // Verify trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Verify user exists and is assigned to this trainer
    const gymUser = await GymUsers.findById(userId);
    if (!gymUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (gymUser.trainer.toString() !== trainerId) {
      return res.status(403).json({ message: "You are not assigned to this user" });
    }

    // Update user's diet PDF
    gymUser.dietPdf = `/uploads/diets/${req.file.filename}`;
    await gymUser.save();

    res.json({
      message: "Diet plan assigned successfully",
      user: {
        id: gymUser._id,
        name: gymUser.name,
        dietPdf: gymUser.dietPdf,
      },
    });
  } catch (error) {
    console.error("Error assigning diet plan:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export { registerTrainer, trainerLogin,getAllTrainers ,deleteTrainer,assignDietPlan};
