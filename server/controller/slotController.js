import Slot from "../model/slotSchema.js";
import Court from "../model/courtSchema.js";
import { User } from "../model/userSchema.js";

const bookSlot = async (req, res) => {
  try {
    const {
      courtId,
      startTime,
      endTime,
      phoneNumber,
      firstName,
      whatsAppNumber,
      lastName,
      address,
      notes,
    } = req.body;
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: "Please provide a Phone Number" });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }
    const overlap = await Slot.findOne({
      courtId,
      isBooked: true,
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlap) {
      const bookedSlots = await Slot.find({ courtId, isBooked: true })
        .sort("startTime")
        .populate("userId");
      return res.status(400).json({
        message: "This time overlaps with an existing booking",
        bookedSlots,
      });
    }

    let user = await User.findOne({ phoneNumber }).lean();
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        phoneNumber,
        whatsAppNumber,
        address,
      });
    } else {
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.address = address || user.address;

      await user.save();
    }

    const slot = await Slot.create({
      courtId,
      startTime: start,
      endTime: end,
      isBooked: true,
      userId: user._id,
      notes,
    });
    const populatedSlot = await Slot.findById(slot._id)
      .populate("userId")
      .populate("courtId");

    res.status(201).json({
      message: "Slot booked successfully",
      data: populatedSlot,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error booking slot", error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // slotId

    const slot = await Slot.findById(id);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (!slot.isBooked) {
      return res.status(400).json({ message: "Slot is not booked" });
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    slot.phone = null;
    slot.notes = null;

    await slot.save();

    res.status(200).json({ message: "Booking cancelled", data: slot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { courtId } = req.params;

    const slots = await Slot.find({ courtId, isBooked: false });

    res.status(200).json({
      message: "Available slots fetched successfully",
      data: slots,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching available slots",
        error: error.message,
      });
  }
};

export { bookSlot, cancelBooking, getAvailableSlots };
