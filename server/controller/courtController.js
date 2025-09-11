import Court from "../model/courtSchema.js";

const createCourt = async (req, res) => {
    const { courtName, surface } = req.body;
    try {
        const response = await Court.create({
            courtName, surface
        })
        res.status(200).json({ message: `Court Created Successfully`, data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error due to', error: error.message })
    }
}

const getCourt = async (req, res) => {
    try {
        const response = await Court.find();
        res.status(200).json({ message: "Court Fetched Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal error due to', error: error.message })
    }
}

const editCourt = async (req, res) => {
    const { id } = req.params;
    const { courtName, surface } = req.body;
    try {
        const response = await Court.findByIdAndUpdate(id, {
            courtName, surface
        }, { new: true })
        res.status(200).json({ message: `Court Edited Successfully`, data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error due to', error: error.message })
    }
}

const deleteCourt = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await Court.findByIdAndDelete(id);
        res.status(200).json({ message: "Court Deleted Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal error due to", error: error.message })
    }
}

export {
    createCourt, getCourt, editCourt, deleteCourt
}