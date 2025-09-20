import { Router } from "express";
import { createGym, deleteGymUser, getAllGymUsers, getGymPaymentHistory, getGymUserById, registerToGym, updateGymUser } from "../controller/gymController.js";
import  uploadDiet  from "../utils/pdfMulter.js";

const gymRouter=Router();
gymRouter.route('/create').post(createGym);
gymRouter.route('/user').post(registerToGym);
gymRouter.route('/all-users').get(getAllGymUsers);
gymRouter.route('/single-user/:id').get(getGymUserById);
gymRouter.route('/edit/:id').patch(uploadDiet,updateGymUser);
gymRouter.route('/delete/:id').delete(deleteGymUser);
gymRouter.route('/payment-history').get(getGymPaymentHistory);






export default gymRouter