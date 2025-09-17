import { Gym } from "../model/gymSchema.js";
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
export{createGym}