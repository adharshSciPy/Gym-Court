import mongoose,{Schema} from "mongoose";
const gymSchema=new Schema({
 name: { type: String, required: true },
  address: { type: String },
  phoneNumber: { type: Number },
})
export const Gym = mongoose.model("Gym", gymSchema);
