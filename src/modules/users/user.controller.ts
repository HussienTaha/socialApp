
import { Router } from "express";
import  UR from "./user.service";


 const userRouter = Router();

userRouter.post("/signup", UR.signup);
userRouter.post("/login", UR.login) 


export default userRouter;