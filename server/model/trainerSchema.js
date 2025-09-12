import mongoose, { Schema } from "mongoose"
const trainerSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String
    },
    experience: {
        type: Number,
        default: 0
    },
    availability: [
        {
            day: { type: String, required: true }, 
            startTime: { type: String, required: true }, 
            endTime: { type: String, required: true }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }

})

const Trainer = mongoose.model("Trainer", trainerSchema);
export default Trainer