import { TokenType } from './../../utils/token';
import { authantcation } from './../../middleware/Authentcation';
import* as UV from './user.vaildation';


import { Router } from "express";
import  UR from "./user.service";
import { Validation } from "../../middleware/vaildation";
import { multerCloud } from '../../middleware/multer.cloud';
import { FILE_TYPES } from '../../utils/fileTypes';


 const userRouter = Router();

userRouter.post("/signup" ,Validation(UV.signUpSchema), UR.signup);
userRouter.post("/login",Validation(UV.loginSchema), UR.login) 
userRouter.patch("/confermedOtp",Validation(UV.confermedotpSchema), UR.confermotp) 
userRouter.get("/profile",authantcation(), UR.gitprofile) 
userRouter.post("/logout",authantcation(),Validation(UV.logoutSchema), UR.logout)
userRouter.get("/refreshToken",authantcation( TokenType.refresh), UR.refreshToken)
userRouter.post("/forgetPassword",Validation(UV.forgetPasswordSchema), UR.forgetPassword)
userRouter.patch("/resetPassword",Validation(UV.reasetPasswordSchema), UR.resetpassword)
//!aws s3 handling uplode image
userRouter.post("/uplode",  authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).single("file") ,UR.uplodeImage)
userRouter.post("/uplodeLargeImage",  authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).single("file") ,UR.uplodeLargeImage)
userRouter.post("/uploadFiles",  authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).array("files") ,UR.uploadFiles)
userRouter.post("/presignedurl",  authantcation() ,UR.uplodeFileswithpresignedurl)
userRouter.delete("/frezed/{:userId}",  authantcation(),Validation(UV.freezeSchema),UR.frezeUser)
userRouter.patch("/unfrezeUser/{:userId}",  authantcation(),Validation(UV.freezeSchema),UR.unfrezeUser)


export default userRouter;