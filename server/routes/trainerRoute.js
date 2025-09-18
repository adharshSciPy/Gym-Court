import { Router } from "express";
import{deleteTrainer, getAllTrainers, registerTrainer,trainerLogin}from "../controller/trainerController.js"
const trainerRouter=Router();
trainerRouter.route('/register').post(registerTrainer);
trainerRouter.route('/login').post(trainerLogin);
trainerRouter.route('/all-trainers').get(getAllTrainers);
trainerRouter.route('/delete/:id').delete(deleteTrainer);//{id:trainer id}


export default trainerRouter