import { Router } from "express";
import { deleteUser, getAllUsers, updateUser } from "../controller/userController.js";
const userRouter=Router();
userRouter.route('/all-users').get(getAllUsers);
userRouter.route('/update/:id').patch(updateUser);//{id:userId}
userRouter.route('/delete/:id').delete(deleteUser);//{id:userId}


export default userRouter