import mongoose, { Schema } from "mongoose";

const GymSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    whatsappNumber: {
        type: String
    },
    address: {
        type: String
    },
    healthNote: {
        type: String
    },
    assignTrainers: {
        type: String
    },
    bookingDate: {
        type: String
    },
    endedDate: {
        type: String
    },
    bookingStatus: {
        type: String
    }
})

const Gym = mongoose.model("Gym", GymSchema);
export default Gym;