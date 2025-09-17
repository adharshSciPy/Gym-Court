import { Router } from "express";
import { createGym, registerToGym } from "../controller/gymController.js";
const gymRouter=Router();
gymRouter.route('/create').post(createGym);
gymRouter.route('/user').post(registerToGym);

export default gymRouter