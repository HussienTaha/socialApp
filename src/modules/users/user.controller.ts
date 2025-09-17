import { TokenType } from './../../utils/token';
import { authantcation } from './../../middleware/Authentcation';
import* as UV from './user.vaildation';


import { Router } from "express";
import  UR from "./user.service";
import { Validation } from "../../middleware/vaildation";


 const userRouter = Router();

userRouter.post("/signup" ,Validation(UV.signUpSchema), UR.signup);
userRouter.post("/login",Validation(UV.loginSchema), UR.login) 
userRouter.patch("/confermedOtp",Validation(UV.confermedotpSchema), UR.confermotp) 
userRouter.get("/profile",authantcation(), UR.gitprofile) 
userRouter.post("/logout",authantcation(),Validation(UV.logoutSchema), UR.logout)
userRouter.get("/refreshToken",authantcation( TokenType.refresh), UR.refreshToken)





export default userRouter;