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

// Utility to validate 10-digit phone numbers
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
      startDate, // subscription start date
    } = req.body;

    // --- Validations ---
    if (!phoneNumber || !isValidPhone(phoneNumber)) {
      return res.status(400).json({ message: "Valid phone number is required" });
    }

    if (!trainerId) return res.status(400).json({ message: "Trainer must be assigned" });
    const trainer = await Trainer.findById(trainerId).session(session);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

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
    } else {
      // Existing user: update optional fields
      user.name = name || user.name;
      user.address = address || user.address;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.notes = notes || user.notes;
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


export{createGym,registerToGym}