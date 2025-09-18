import { Router } from 'express'
import { getAllReceptionists, receptionistLogin, registerReceptionist } from '../controller/receptionistController.js';

const receptionistRouter=Router();
receptionistRouter.route('/register').post(registerReceptionist);
receptionistRouter.route('/login').post(receptionistLogin);
receptionistRouter.route('/all-receptionists').get(getAllReceptionists);

export default receptionistRouter