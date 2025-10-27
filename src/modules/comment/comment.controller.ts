import { Router } from "express";
import { authantcation } from "../../middleware/Authentcation";
import { multerCloud } from "../../middleware/multer.cloud";
import { FILE_TYPES } from "../../utils/fileTypes";
import { Validation } from "../../middleware/vaildation";
import * as CV from "./comment.vaildation";
import CS from "./comment.service";

const commentRouter = Router({mergeParams : true});

commentRouter.post(
  "/create",
  authantcation(),
  multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES) }).array(
    "attachments"
  ),
  Validation(CV.createCommentSchema),
  CS.createcomment
);
commentRouter.patch(
  "/updatecomment/:commentId",
  authantcation(),
  multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES) }).array(
    "attachments"
  ),
  Validation(CV.updateCommentSchema),
  CS.updatecomment
);
commentRouter.delete(
  "/deletecomment/:commentId",
  authantcation(),
  Validation(CV.deleteCommentSchema),
  CS.deletecomment
);

export default commentRouter;
