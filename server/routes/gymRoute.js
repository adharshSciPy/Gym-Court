import { Router } from "express";
import { createGym, getAllGymUsers, getGymUserById, registerToGym } from "../controller/gymController.js";
const gymRouter=Router();
gymRouter.route('/create').post(createGym);
gymRouter.route('/user').post(registerToGym);
gymRouter.route('/all-users').get(getAllGymUsers);
gymRouter.route('/single-user/:id').get(getGymUserById);



export default gymRouter