import Slot from "../model/slotSchema.js";
import Court from "../model/courtSchema.js";
import { User } from "../model/userSchema.js";
const formatTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().substring(11, 16); 
};

const bookSlot = async (req, res) => {
  try {
    const {
      courtId,
      startDate,
      endDate,
      startTime,
      endTime,
      phoneNumber,
      firstName,
      lastName,
      whatsAppNumber,
      address,
      notes,
    } = req.body;

    if (!courtId) return res.status(400).json({ message: "Court ID is required" });
    if (!startDate || !endDate) return res.status(400).json({ message: "Start and end date are required" });
    if (!startTime || !endTime) return res.status(400).json({ message: "Start and end time are required" });
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }
    if (firstName && firstName.length > 50) return res.status(400).json({ message: "First name too long" });
    if (lastName && lastName.length > 50) return res.status(400).json({ message: "Last name too long" });
    if (address && address.length > 200) return res.status(400).json({ message: "Address too long" });
    if (notes && notes.length > 300) return res.status(400).json({ message: "Notes too long" });
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startT = new Date(startTime);
    const endT = new Date(endTime);

    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid start or end date" });
    if (isNaN(startT) || isNaN(endT)) return res.status(400).json({ message: "Invalid start or end time" });
    if (start > end) return res.status(400).json({ message: "Start date must be before end date" });
    if (startT >= endT) return res.status(400).json({ message: "Start time must be before end time" })
    const maxRangeDays = 365;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) {
      return res.status(400).json({ message: `Booking cannot exceed ${maxRangeDays} days` });
    }
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({ firstName, lastName, phoneNumber, whatsAppNumber, address });
    } else {
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.address = address || user.address;
      await user.save();
    }
    const overlap = await Slot.findOne({
      courtId,
      isBooked: true,
      startDate: { $gte: start, $lte: end },
      startTime: { $lt: endT },
      endTime: { $gt: startT },
    }).populate("userId");

if (overlap) {
  return res.status(400).json({
    message: `Overlap found on ${overlap.startDate.toDateString()} for this court`,
    time: `${formatTime(overlap.startTime)} - ${formatTime(overlap.endTime)}`,
    bookedBy: overlap.userId 
      ? `${overlap.userId.firstName || ""} ${overlap.userId.lastName || ""}`.trim()
      : "Unknown"
  });
}

    let current = new Date(start);
    const slotsToCreate = [];

    while (current <= end) {
      slotsToCreate.push({
        courtId,
        startDate: new Date(current),
        endDate: new Date(current),
        startTime: startT,
        endTime: endT,
        isBooked: true,
        userId: user._id,
        notes,
      });
      current.setDate(current.getDate() + 1);
    }
    const createdSlots = await Slot.insertMany(slotsToCreate);

    const populatedSlots = await Slot.find({
      _id: { $in: createdSlots.map((s) => s._id) },
    })
      .populate("userId")
      .populate("courtId");

    return res.status(201).json({
      message: "Slots booked successfully",
      data: populatedSlots,
    });
  } catch (err) {
    return res.status(500).json({ message: "Unexpected error", error: err.message });
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
