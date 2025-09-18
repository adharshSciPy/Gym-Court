import { Router } from "express";
import{getAllTrainers, registerTrainer,trainerLogin}from "../controller/trainerController.js"
const trainerRouter=Router();
trainerRouter.route('/register').post(registerTrainer);
trainerRouter.route('/login').post(trainerLogin);
trainerRouter.route('/all-trainers').get(getAllTrainers);

export default trainerRouter