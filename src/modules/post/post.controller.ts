import { Router } from "express";
import PS from "./post.service"
import { Validation } from "../../middleware/vaildation";
import * as PV from "./post.validation";
import { authantcation } from "../../middleware/Authentcation";
import { multerCloud } from "../../middleware/multer.cloud";
import { FILE_TYPES } from "../../utils/fileTypes";

 const postRouter=Router({})
 postRouter.post("/create" , authantcation() ,multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).array("attachments"),Validation(PV.createPostSchema),PS.createpost )
 //! like post and unlike in qurey ?action=like or ?action=unlike
postRouter.patch("/like/:postId", authantcation(),Validation(PV.liksPostSchema),PS.likepost)
postRouter.patch("/update/:postId", authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).array("attachments"),Validation(PV.updatePostSchema),PS.updatepost)
postRouter.patch("/delete/:postId", authantcation(),Validation(PV.liksPostSchema),PS.deletepost)


export default postRouter