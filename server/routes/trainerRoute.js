import express from "express"
import { createTrainer, getTrainers, getTrainerById, editTrainer, deleteTrainer } from "../controller/trainerController.js";

const trainerRoute = express.Router();

trainerRoute.route("/createTrainer").post(createTrainer)
trainerRoute.route("/getTrainers").get(getTrainers)
trainerRoute.route("/getTrainerById/:id").get(getTrainerById)
trainerRoute.route("/editTrainer/:id").put(editTrainer)
trainerRoute.route("/deleteTrainer/:id").delete(deleteTrainer)


export default trainerRoute