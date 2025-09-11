import Slot from "../model/slotSchema.js";
import Court from "../model/courtSchema.js";

const createSlot = async (req, res) => {
    try {
        const { courtId, startTime, endTime } = req.body;

        // check court exists
        const court = await Court.findById(courtId);
        if (!court) {
            return res.status(404).json({ message: "Court not found" });
        }

        // prevent duplicate slot for same time range
        const existing = await Slot.findOne({ courtId, startTime, endTime });
        if (existing) {
            return res.status(400).json({ message: "Slot already exists for this time" });
        }

        const slot = await Slot.create({
            courtId,
            startTime,
            endTime
        });

        res.status(201).json({
            message: "Slot created successfully",
            data: slot
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating slot", error: error.message });
    }
};



const bookSlot = async (req, res) => {
    try {
        const { id } = req.params; // slotId
        const { bookedBy, phone, notes } = req.body;

        const slot = await Slot.findById(id);

        if (!slot) {
            return res.status(404).json({ message: "Slot not found" });
        }

        if (slot.isBooked) {
            return res.status(400).json({ message: "Slot already booked" });
        }

        slot.isBooked = true;
        slot.bookedBy = bookedBy;
        slot.phone = phone;
        slot.notes = notes;

        await slot.save();

        res.status(200).json({
            message: "Slot booked successfully",
            data: slot
        });
    } catch (error) {
        res.status(500).json({ message: "Error booking slot", error: error.message });
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
        res.status(500).json({ message: "Error cancelling booking", error: error.message });
    }
};

const getAvailableSlots = async (req, res) => {
    try {
        const { courtId } = req.params;

        const slots = await Slot.find({ courtId, isBooked: false });

        res.status(200).json({
            message: "Available slots fetched successfully",
            data: slots
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching available slots", error: error.message });
    }
};


export {
    createSlot, bookSlot, cancelBooking, getAvailableSlots
}
