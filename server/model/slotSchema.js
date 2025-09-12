import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema({
  courtId: { type: Schema.Types.ObjectId, ref: "Court", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },

  userId: { type: Schema.Types.ObjectId, ref: "User" },
  notes: { type: String }
});




const Slot = mongoose.model("Slot", slotSchema);
export default Slot;
