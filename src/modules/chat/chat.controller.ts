import { Router } from "express";
import { authantcation } from "../../middleware/Authentcation";
import { ChatService } from "./chat.service";
import { Validation } from "../../middleware/vaildation";
import * as CV from "./chat.validation"
import { multerCloud } from "../../middleware/multer.cloud";
import { FILE_TYPES } from "../../utils/fileTypes";
const chatRouter = Router({ mergeParams: true })
const CS =new ChatService()
chatRouter.get("/",authantcation(),Validation(CV.chatSchema),CS.getChats)
chatRouter.post ("/creategroup",authantcation(),multerCloud({ fileTypes: Object.values(FILE_TYPES.IMAGES)}).single("file"),Validation(CV.createGroupChatSchema),CS.createGoupChat)
chatRouter.get ("/group/:groupId",authantcation(),Validation(CV.chatGroupSchema),CS.getGoupChat)

export default chatRouter