import mongoose, { Schema } from "mongoose";

const billingSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },

    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },     
    isGst: { type: Boolean, default: false }, 
    gst: { type: Number, default: 0 },  
    gstNumber: { type: String }, 

    modeOfPayment: {
      type: String,
      enum: ["card", "upi", "cash"],
      required: true,
    },

   
    notes: { type: String },
  },
  { timestamps: true }
);

const Billing = mongoose.model("Billing", billingSchema);
export default Billing;
