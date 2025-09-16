import Slot from "../model/slotSchema.js";
import Court from "../model/courtSchema.js";
import { User } from "../model/userSchema.js";
import Booking from "../model/bookingSchema.js"
import mongoose from "mongoose";
import Billing from "../model/billingSchema.js";
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
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
    } = req.body;

    // --- Common Validations ---
    if (!courtId) return res.status(400).json({ message: "Court ID is required" });

    if (!startDate || !endDate) return res.status(400).json({ message: "Start and end date are required" });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid start or end date" });
    if (start > end) return res.status(400).json({ message: "Start date must be before end date" });
    const maxRangeDays = 365;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) return res.status(400).json({ message: `Booking cannot exceed ${maxRangeDays} days` });

    if (!startTime || !endTime) return res.status(400).json({ message: "Start and end time are required" });
    const [startH, startM = 0] = startTime.split(":").map(Number);
    const [endH, endM = 0] = endTime.split(":").map(Number);
    if (isNaN(startH) || isNaN(endH)) return res.status(400).json({ message: "Invalid time format, expected HH:mm" });

    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
    if (!/^[0-9]{10}$/.test(phoneNumber)) return res.status(400).json({ message: "Phone number must be 10 digits" });

    if (notes && notes.length > 300) return res.status(400).json({ message: "Notes too long (max 300 chars)" });

    // --- Payment & Billing Validations ---
    if (amount == null) return res.status(400).json({ message: "Amount is required" });
    if (isNaN(amount) || amount < 0) return res.status(400).json({ message: "Amount must be a positive number" });

    // if (typeof isGst !== "boolean") return res.status(400).json({ message: "isGst must be a boolean" });

    if (isGst) {
      if (gst == null || isNaN(gst) || gst < 0) return res.status(400).json({ message: "GST must be a valid non-negative number" });
      if (!gstNumber || gstNumber.length > 20) return res.status(400).json({ message: "GST Number is required and max 20 chars" });
    }

    if (!modeOfPayment) return res.status(400).json({ message: "Payment mode is required" });
    const validPayments = ["card", "upi", "cash"];
    if (!validPayments.includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid payment mode, must be card, upi, or cash" });
    }

    // --- Court Exists ---
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // --- User Handling ---
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Validate new user fields
      if (!firstName || firstName.length > 50) return res.status(400).json({ message: "First name is required (max 50 chars)" });
      if (!lastName || lastName.length > 50) return res.status(400).json({ message: "Last name is required (max 50 chars)" });
      if (!whatsAppNumber || !/^[0-9]{10}$/.test(whatsAppNumber)) return res.status(400).json({ message: "WhatsApp number must be 10 digits" });
      if (!address || address.length > 200) return res.status(400).json({ message: "Address is required (max 200 chars)" });

      user = await User.create({ firstName, lastName, phoneNumber, whatsAppNumber, address });
    } else {
      // Update if provided
      if (firstName && firstName.length > 50) return res.status(400).json({ message: "First name too long" });
      if (lastName && lastName.length > 50) return res.status(400).json({ message: "Last name too long" });
      if (whatsAppNumber && !/^[0-9]{10}$/.test(whatsAppNumber)) return res.status(400).json({ message: "WhatsApp number must be 10 digits" });
      if (address && address.length > 200) return res.status(400).json({ message: "Address too long" });

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.address = address || user.address;
      await user.save();
    }

    // --- Prepare slots ---
    const slotsToCreate = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(startH, startM, 0, 0);

      const slotEnd = new Date(currentDate);
      slotEnd.setHours(endH, endM, 0, 0);

      if (slotStart >= slotEnd) {
        return res.status(400).json({ message: "Start time must be before end time" });
      }

      // Check overlap
      const overlap = await Slot.findOne({
        courtId,
        isBooked: true,
        $or: [
          { startTime: { $lt: slotEnd }, endTime: { $gt: slotStart } }
        ],
      }).populate("userId");

      if (overlap) {
        return res.status(400).json({
          message: "Overlap found with existing booking",
          details: {
            date: overlap.startDate.toDateString(),
            time: `${overlap.startTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${overlap.endTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
            bookedBy: overlap.userId ? `${overlap.userId.firstName || ""} ${overlap.userId.lastName || ""}`.trim() : "Unknown",
          },
        });
      }

      slotsToCreate.push({
        courtId,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate),
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: true,
        isMultiDay: start.getTime() !== end.getTime(),
        userId: user._id,
        notes,
        amount,
        isGst,
        gst,
        gstNumber,
        modeOfPayment,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Save slots
    const createdSlots = await Slot.insertMany(slotsToCreate);

    // Save booking
    const booking = await Booking.create({
      courtId,
      userId: user._id,
      slotIds: createdSlots.map((s) => s._id),
      startDate: start,
      endDate: end,
      startTime: new Date(start.setHours(startH, startM, 0, 0)),
      endTime: new Date(end.setHours(endH, endM, 0, 0)),
      isMultiDay: start.toDateString() !== end.toDateString(),
      notes,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
    });

    // Save billing
    await Billing.create({
      bookingId: booking._id,
      userId: user._id,
      courtId,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
    });

    // Format response
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    const formattedBooking = {
      ...booking.toObject(),
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
      startTime: formatTime(booking.startTime),
      endTime: formatTime(booking.endTime),
    };

    return res.status(201).json({
      message: "Slots booked successfully",
      booking: formattedBooking,
      
    });
  } catch (err) {
    console.error("Error in bookSlot:", err);
    return res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};


const bookedSlots = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Court ID is required" });
  }

  try {
    // Get start/end of day in IST
    const getISTDayRange = (inputDate) => {
      let target = inputDate ? new Date(inputDate) : new Date();
      const istString = target.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const istDate = new Date(istString);

      const start = new Date(istDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(istDate);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    };

    const { start, end } = getISTDayRange(date);

    // Aggregation pipeline for faster query & formatting
    const slots = await Slot.aggregate([
      { $match: { courtId: new mongoose.Types.ObjectId(id), isBooked: true, startDate: { $gte: start, $lte: end } } },
      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      // Lookup court
      {
        $lookup: {
          from: "courts",
          localField: "courtId",
          foreignField: "_id",
          as: "court",
        },
      },
      { $unwind: { path: "$court", preserveNullAndEmptyArrays: true } },
      // Project only necessary fields
      {
        $project: {
          slotId: "$_id",
          courtName: "$court.courtName",
          userFirstName: "$user.firstName",
          userLastName: "$user.lastName",
          phoneNumber: "$user.phoneNumber",
          notes: 1,
          startTime: 1,
          endTime: 1,
          startDate: 1,
        },
      },
      { $sort: { startDate: 1, startTime: 1 } },
    ]);

    if (!slots.length) {
      return res.status(200).json({
        message: date
          ? `No bookings found for ${new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}`
          : "No bookings found for today",
        count: 0,
        data: [],
      });
    }

    // Format date/time in JS, only once per slot
    const formatted = slots.map((slot) => {
      const startIST = new Date(slot.startTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      const endIST = new Date(slot.endTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

      return {
        slotId: slot.slotId,
        court: slot.courtName || "Unknown Court",
        bookedBy: `${slot.userFirstName || ""} ${slot.userLastName || ""}`.trim(),
        phoneNumber: slot.phoneNumber || "",
        date: new Date(slot.startDate).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }),
        time: `${startIST} - ${endIST}`,
        notes: slot.notes || "",
      };
    });

    return res.status(200).json({
      message: date ? `Bookings for ${new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })}` : "Today's booked slots",
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
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

    // Cancel booking
    slot.isBooked = false;
    slot.userId = null;   // remove the booked user
    slot.notes = null;    // clear notes

    await slot.save();

    res.status(200).json({ message: "Booking cancelled successfully", data: slot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: error.message });
  }
};
const renewSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startDate, endDate, startTime, endTime } = req.body;

    if (!slotId) return res.status(400).json({ message: "Slot ID is required" });
    if (!startDate || !endDate) return res.status(400).json({ message: "Start and end date are required" });
    if (!startTime || !endTime) return res.status(400).json({ message: "Start and end time are required" });

    const originalSlot = await Slot.findById(slotId).populate("userId").populate("courtId");
    if (!originalSlot) return res.status(404).json({ message: "Original slot not found" });

    const courtId = originalSlot.courtId._id;
    const userId = originalSlot.userId._id;
    const notes = originalSlot.notes;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return res.status(400).json({ message: "Start date must be before end date" });

    const maxRangeDays = 365;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) return res.status(400).json({ message: `Booking cannot exceed ${maxRangeDays} days` });

    // --- Prepare slots to create ---
    const slotsToCreate = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const [startH, startM, startS] = startTime.split(":").map(Number);
      const [endH, endM, endS] = endTime.split(":").map(Number);

      const slotStart = new Date(currentDate);
      slotStart.setHours(startH, startM, startS, 0);

      const slotEnd = new Date(currentDate);
      slotEnd.setHours(endH, endM, endS, 0);

      if (slotStart >= slotEnd) return res.status(400).json({ message: "Start time must be before end time" });

      // Check overlap for this date
      const overlap = await Slot.findOne({
        courtId,
        isBooked: true,
        startDate: currentDate,
        $or: [
          { startTime: { $lt: slotEnd }, endTime: { $gt: slotStart } },
        ],
      });

      if (overlap) {
        return res.status(400).json({
          message: `Overlap found on ${overlap.startDate.toDateString()} for this court`,
          time: `${formatTime(overlap.startTime)} - ${formatTime(overlap.endTime)}`,
        });
      }

      slotsToCreate.push({
        courtId,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate),
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: true,
        userId,
        notes,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const createdSlots = await Slot.insertMany(slotsToCreate);
    const populatedSlots = await Slot.find({ _id: { $in: createdSlots.map(s => s._id) } })
      .populate("userId")
      .populate("courtId");

    return res.status(201).json({
      message: "Slots renewed successfully",
      data: populatedSlots,
    });

  } catch (err) {
    return res.status(500).json({ message: "Unexpected error", error: err.message });
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
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

export { bookSlot, cancelBooking, getAvailableSlots, bookedSlots,renewSlot };
