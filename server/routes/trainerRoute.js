import { Router } from "express";
import{assignDietPlan, deleteTrainer, getAllTrainers, getUsersByTrainer, registerTrainer,trainerLogin}from "../controller/trainerController.js"
import  uploadDiet  from "../utils/pdfMulter.js";
const trainerRouter=Router();
trainerRouter.route('/register').post(registerTrainer);
trainerRouter.route('/login').post(trainerLogin);
trainerRouter.route('/all-trainers').get(getAllTrainers);
trainerRouter.route('/delete/:id').delete(deleteTrainer);//{id:trainer id}
trainerRouter.route('/assigned-users/:id').get(getUsersByTrainer)//{id:trainerId}
trainerRouter.route('/assign-diet-plan/:id').post(uploadDiet,assignDietPlan);//{id:trainer id}



export default trainerRouter