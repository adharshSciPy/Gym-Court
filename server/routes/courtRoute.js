import express from 'express'
import { createCourt, getCourt, editCourt, deleteCourt } from '../controller/courtController.js'

const courtRouter = express.Router()
courtRouter.route("/createCourt").post(createCourt)
courtRouter.route("/fetchCourts").get(getCourt)
courtRouter.route("/editCourt/:id").put(editCourt)
courtRouter.route("/deleteCourt/:id").delete(deleteCourt)


export default courtRouter

