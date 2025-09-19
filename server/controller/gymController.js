import { Gym } from "../model/gymSchema.js";
import mongoose from "mongoose";
import { GymUsers } from "../model/gymUserSchema.js";
import { Trainer } from "../model/trainerSchema.js";
import GymBilling from "../model/gymBillingSchema.js";


const createGym = async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body || {};

    // Basic validations
    if (!name || !address || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, address, and phone number are required."
      });
    }

    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ success: false, message: "Invalid name format." });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Phone number must be 10 digits." });
    }

    if (address.length < 5) {
      return res.status(400).json({ success: false, message: "Address is too short." });
    }

    // Check if phone number already exists
    const existingGym = await Gym.findOne({ phoneNumber });
    if (existingGym) {
      return res.status(400).json({
        success: false,
        message: "A gym with this phone number already exists."
      });
    }

    // Save to database
    const newGym = await Gym.create({ name, address, phoneNumber });

    return res.status(201).json({
      success: true,
      message: "Gym created successfully!",
      data: newGym
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};


const isValidPhone = (num) => /^[0-9]{10}$/.test(num);

const registerToGym = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      address,
      phoneNumber,
      whatsAppNumber,
      notes,
      trainerId,
      dietPdf, // optional
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
      subscriptionMonths = 1, // default 1 month
      startDate,
      userType
    } = req.body;

    // --- Validations ---
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      return res.status(400).json({ message: "Valid phone number is required" });
    }

    if (!trainerId) return res.status(400).json({ message: "Trainer must be assigned" });
    const trainer = await Trainer.findById(trainerId).session(session);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
if (!["athlete", "non-athlete"].includes(userType)) {
  return res.status(400).json({ message: "Invalid userType. Must be 'athlete' or 'non-athlete'" });
}
    if (subscriptionMonths < 1 || subscriptionMonths > 12) {
      return res.status(400).json({ message: "Subscription months must be between 1 and 12" });
    }

    if (!amount || isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const validPayments = ["card", "upi", "cash"];
    if (!modeOfPayment || !validPayments.includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid payment mode" });
    }

    if (isGst) {
      if (!gst || isNaN(gst) || gst < 0)
        return res.status(400).json({ message: "GST must be a valid non-negative number" });
      if (!gstNumber || gstNumber.length > 20)
        return res.status(400).json({ message: "GST number is required and max 20 chars" });
    }

    // --- Check if user exists ---
    let user = await GymUsers.findOne({ phoneNumber }).session(session);

    const subscriptionStart = new Date(startDate);
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + subscriptionMonths);

    // --- Overlap validation ---
    if (user && user.subscription) {
      const { startDate: existingStart, endDate: existingEnd, status } = user.subscription;

      if (status === "active") {
        const existingStartDate = new Date(existingStart);
        const existingEndDate = new Date(existingEnd);

        const overlaps =
          (subscriptionStart <= existingEndDate && subscriptionEnd >= existingStartDate);

        if (overlaps) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: "User already has an active subscription in this period" });
        }
      }
    }

    if (!user) {
      // New user validations
      if (!name || name.length > 50) return res.status(400).json({ message: "Valid name is required" });
      if (!address || address.length > 200) return res.status(400).json({ message: "Valid address is required" });
      if (!whatsAppNumber || !isValidPhone(whatsAppNumber))
        return res.status(400).json({ message: "Valid WhatsApp number is required" });

      // Create new user
      user = await GymUsers.create(
        [
          {
            name,
            address,
            phoneNumber,
            whatsAppNumber,
            notes,
            trainer: trainer._id,
            dietPdf,
             userType,
            subscription: {
              startDate: subscriptionStart,
              endDate: subscriptionEnd,
              months: subscriptionMonths,
              status: "active",
            },
          },
        ],
        { session }
      );
      user = user[0];

      // 🔗 Add user to trainer's users array
      trainer.users.push(user._id);
      await trainer.save({ session });

    } else {
      // Existing user: update optional fields
      user.name = name || user.name;
      user.address = address || user.address;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.notes = notes || user.notes;
      user.userType = userType || user.userType;

      if (dietPdf) user.dietPdf = dietPdf;
      user.trainer = trainer._id;

      // Update subscription
      user.subscription = {
        startDate: subscriptionStart,
        endDate: subscriptionEnd,
        months: subscriptionMonths,
        status: "active",
      };

      await user.save({ session });

      // 🔗 Ensure user is in trainer's users array
      if (!trainer.users.includes(user._id)) {
        trainer.users.push(user._id);
        await trainer.save({ session });
      }
    }

    // --- Save billing info ---
    await GymBilling.create(
      [
        {
          userId: user._id,
          amount,
          isGst,
          gst,
          gstNumber,
          modeOfPayment,
          subscriptionMonths,
          startDate: subscriptionStart,
          endDate: subscriptionEnd,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "User registered successfully with gym subscription",
      data: user,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in registerToGym:", err);
    res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};
const getAllGymUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      trainerName,
      userType, // NEW: filter by athlete / non-athlete
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = {};

    // --- Search by name or phone number ---
    if (search) {
      if (!isNaN(search)) {
        query.phoneNumber = Number(search);
      } else {
        query.name = { $regex: search, $options: "i" };
      }
    }

    // --- Filter by subscription status ---
    if (status && ["active", "expired"].includes(status)) {
      query["subscription.status"] = status;
    }

    // --- Filter by trainerName ---
    if (trainerName) {
      const trainers = await Trainer.find({
        trainerName: { $regex: trainerName, $options: "i" },
      }).select("_id");

      if (trainers.length > 0) {
        query.trainer = { $in: trainers.map((t) => t._id) };
      } else {
        return res.status(404).json({
          success: false,
          message: "No trainers found with the given name",
        });
      }
    }

    // --- Filter by userType ---
    if (userType && ["athlete", "non-athlete"].includes(userType)) {
      query.userType = userType;
    }

    // --- Fetch users and total count in parallel ---
    const [users, total] = await Promise.all([
      GymUsers.find(query)
        .populate("trainer", "trainerName trainerEmail phoneNumber")
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      GymUsers.countDocuments(query),
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: "No gym users found" });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
      message: "Gym users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching gym users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



const getGymUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await GymUsers.findById(id)
      .populate("trainer", "trainerName trainerEmail phoneNumber")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "Gym user not found" });
    }

    res.status(200).json({
      success: true,
      message: "Gym user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching gym user:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


export{createGym,registerToGym,getAllGymUsers,getGymUserById}