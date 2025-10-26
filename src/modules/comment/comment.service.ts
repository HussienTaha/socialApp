import {
  AllowCommentEnum,
  AvailabilityEnum,
} from "./../../DB/models/post.model";

import { NextFunction, Request, Response } from "express";
import PostModel from "../../DB/models/post.model";
import userModel from "../../DB/models/user.model";
import { postRepository } from "../../DB/repositories/post.reposatories ";
import { UserRepository } from "../../DB/repositories/user.reposatories";
import { commentRepository } from "../../DB/repositories/comment.reposatories";
import commentModel from "../../DB/models/comment.model ";
import { CustomError } from "../../utils/classErrorHandling";
import { v4 as uuidv4 } from "uuid";
import { uploadFiles } from "../../utils/s3config";
import  { Types } from "mongoose";
class commentService {
  private _userModel = new UserRepository(userModel);
  private _postModel = new postRepository(PostModel);
  private _commentModel = new commentRepository(commentModel);

  constructor() {}

  createcomment = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    let { content, attachments, tags } = req.body;

    const post = await this._postModel.findOne({
      _id: postId,
      isDeleted: false,
      allowComment: AllowCommentEnum.ALLOW,
      AvailabilityEnum: [AvailabilityEnum.PUBLIC, AvailabilityEnum.FRIENDS],
    });
    if (!post) {
      throw new CustomError("post not found", 404);
    }

    if (
      req?.body?.tags?.length &&
      (await this._userModel.find({ _id: { $in: req.body.tags } })).length !==
        req.body.tags.length
    ) {
      throw new CustomError("Invalid user id(s) in tags", 400);
    }


    const assetFolderId = uuidv4();
    if (attachments?.length) {
      attachments =  await uploadFiles({
    files: req.files as Express.Multer.File[],
    path: `users/${post?.createdBy}/posts/${post?.assetFolderId}/comments/${assetFolderId}`,
  });
    }

const comment = await this._commentModel.create({
  content,
  tags,
  attachments,
  assetFolderId,
  createdBy: req.user?._id as  unknown as Types.ObjectId,
  postId:postId as unknown as Types.ObjectId ,
  
})


    return res
      .status(200)
      .json({ message: "success create comment ❤️👌", comment });
  };
}

export default new commentService();
