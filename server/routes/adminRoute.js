import { Router } from 'express'
import { adminLogin, registerAdmin } from '../controller/adminController.js';
const adminRouter=Router();
adminRouter.route('/register').post(registerAdmin);
adminRouter.route('/login').post(adminLogin)
export default adminRouter