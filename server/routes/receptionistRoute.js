import { Router } from 'express'
import { receptionistLogin, registerReceptionist } from '../controller/receptionistController.js';

const receptionistRouter=Router();
receptionistRouter.route('/register').post(registerReceptionist);
receptionistRouter.route('/login').post(receptionistLogin)
export default receptionistRouter