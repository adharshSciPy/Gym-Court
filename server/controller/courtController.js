import Court from "../model/courtSchema";

const createCourt = async (req, res) => {
    try {
        const res = await Court.create({
            courtName, surface
        })
        res.status(200).json({ message: `Court Created Successfully`, data: res })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error due to', error: error.message })
    }
}

export {
    createCourt

}