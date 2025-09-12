import Trainer from "../model/trainerSchema.js";

const createTrainer = async (req, res) => {
    try {
        const { name, email, phoneNumber, experience, availability } = req.body;
        const response = await Trainer.create({
            name, email, phoneNumber, experience, availability
        })
        res.status(200).json({ message: "Trainer Created Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal Server error due to", error: error.message })
    }
}

const getTrainers = async (req, res) => {
    try {
        const response = await Trainer.find();
        res.status(200).json({ message: "Fetched Trainers Details", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal server error due to", error: error.message })
    }
}

const getTrainerById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Trainer.findById(id);
        res.status(200).json({ message: "Trainer Detail", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal server error due to", error: error.message })
    }
}

const editTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, experience, availability } = req.body;
        const response = await Trainer.findByIdAndUpdate(id, {
            name, email, phoneNumber, experience, availability
        }, { new: true })
        res.status(200).json({ message: "Trainer Edited Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal Server error due to", error: error.message })
    }
}

const deleteTrainer = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await Trainer.findByIdAndDelete(id)
        res.status(200).json({ message: "Trainer Deleted Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal Server error due to", error: error.message })
    }
}

export {
    createTrainer, getTrainers, getTrainerById, editTrainer, deleteTrainer
}