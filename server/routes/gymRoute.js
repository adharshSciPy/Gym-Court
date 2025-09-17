import { Router } from "express";
import { createGym } from "../controller/gymController.js";
const gymRouter=Router();
gymRouter.route('/create').post(createGym);
export default gymRouter