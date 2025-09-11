import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema({
  courtId: { 
    type: Schema.Types.ObjectId, 
    ref: "Court", 
    required: true 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },  
  isBooked: { type: Boolean, default: false },

  // Booking details (optional since receptionist handles it)
  bookedBy: { type: String }, // customer name
  phone: { type: String },    // customer phone
  notes: { type: String }     // any extra info
});



const Slot = mongoose.model("Slot", slotSchema);
export default Slot;
