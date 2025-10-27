import { Router } from "express";
import PS from "./post.service"
import { Validation } from "../../middleware/vaildation";
import * as PV from "./post.validation";
import { authantcation } from "../../middleware/Authentcation";
import { multerCloud } from "../../middleware/multer.cloud";
import { FILE_TYPES } from "../../utils/fileTypes";
import commentRouter from "../comment/comment.controller";

 const postRouter=Router({})



 postRouter.use("/:postId/comments",commentRouter )
 postRouter.post("/create" , authantcation() ,multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).array("attachments"),Validation(PV.createPostSchema),PS.createpost )
 //! like post and unlike in qurey ?action=like or ?action=unlike
postRouter.patch("/like/:postId", authantcation(),Validation(PV.liksPostSchema),PS.likepost)
postRouter.patch("/update/:postId", authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).array("attachments"),Validation(PV.updatePostSchema),)
postRouter.patch("/delete/:postId", authantcation(),Validation(PV.liksPostSchema),PS.deletepost)
postRouter.get("/getposts",PS.getposts)


export default postRouter