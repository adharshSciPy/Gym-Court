import express from 'express'
import courtController from "../controller/courtController.js";

const router = express.Router()

router.post("/createCourt", courtController.createCourt)


export default router

