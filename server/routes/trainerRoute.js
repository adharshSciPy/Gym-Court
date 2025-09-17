import { Router } from "express";
import{registerTrainer,trainerLogin}from "../controller/trainerController.js"
const trainerRouter=Router();
trainerRouter.route('/register').post(registerTrainer);
trainerRouter.route('/login').post(trainerLogin);
export default trainerRouter