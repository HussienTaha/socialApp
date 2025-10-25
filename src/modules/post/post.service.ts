import { AvailabilityEnum, IPost } from './../../DB/models/post.model';
import { UpdateQuery } from 'mongoose';
import { NextFunction, Response, Request } from 'express';
import PostModel from "../../DB/models/post.model";
import userModel from "../../DB/models/user.model";
import { postRepository } from "../../DB/repositories/post.reposatories ";
import { UserRepository } from "../../DB/repositories/user.reposatories";
import { CustomError } from '../../utils/classErrorHandling';
import { v4 as uuidv4 } from "uuid";
import { deletefiles, uploadFiles } from '../../utils/s3config';
import { actionEnum, liksPostInput, liksPostQuery } from './post.validation';




class postservice{
      private _userModel = new UserRepository(userModel);
      private _postModel = new postRepository(PostModel);

constructor(){}

createpost= async ( req :Request , res :Response  , next :NextFunction)=>{
 if (
      req?.body?.tags?.length &&
      (await this._userModel.find({ _id: { $in: req.body.tags } })).length !==
        req.body.tags.length
    ) {
      throw new CustomError("Invalid user id(s) in tags", 400);
    }


    const assetFolderId = uuidv4();

    
    let attachments: string[] = [];
    if (req?.files?.length) {
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/posts/${assetFolderId}`,
      });
    }

    const post = await this._postModel.create({
      ...req.body,
      attachments,
      assetFolderId,
      createdBy: req.user?._id, // صاحب الأكونت اللي عامل post
    });

if(!post)
{
  
await deletefiles({
  Bucket: process.env.AWS_BUCKET_NAME!,
  urls: attachments || [],
})
}
    return res.status(201).json({
      message: "Post created successfully ❤️👌",
      post,
    });
 
}
likepost =async ( req :Request , res :Response  , next :NextFunction)=>{
 const {postId}:liksPostInput= req.params  as liksPostInput
 const {action}:liksPostQuery=req.query as liksPostQuery

let updateQuery : UpdateQuery<IPost>= { $addToSet: { likes: req.user?._id }}
if (action === actionEnum.unlike) {
    updateQuery = { $pull: { likes: req.user?._id } };
}



 const post = await this._postModel.findOneAndupdate({ _id: postId,
     $or:[{availability:AvailabilityEnum.PUBLIC},
        {availability:AvailabilityEnum.PRIVATE,createdBy:req.user?._id},
        {
            availability:AvailabilityEnum.FRIENDS,createdBy:{$in :[...req?.user?.friends || [] ,req.user?._id]}}
        ]} ,updateQuery , {new : true });

 
if (!post) {
  throw new CustomError("failed && Post not found", 404);
}
return res.status(200).json({
  message: "Post liked successfully ❤️👌",
  post,
});




}


updatepost =async ( req :Request , res :Response  , next :NextFunction)=>{

const {postId}:liksPostInput= req.params  as liksPostInput

const post = await this._postModel.findOne({
  _id: postId,
  createdBy: req.user?._id,
});

if (!post) {
  throw new CustomError("Failed to update post or unauthorized", 404);
}

// ✅ تحديث المحتوى لو اتبعت
if (req?.body?.content) {
  post.content = req.body.content;
}

// ✅ تحديث نوع الإتاحة
if (req?.body?.availability) {
  post.availability = req.body.availability;
}

// ✅ تحديث حالة التعليقات
if (req?.body?.allowComment) {
  post.allowComment = req.body.allowComment;
}

// ✅ لو فيه صور جديدة مرفوعة
if (req?.files?.length) {
  // نحذف الصور القديمة
  await deletefiles({ urls: post.attachments || [] });

  // نرفع الصور الجديدة
  post.attachments = await uploadFiles({
    files: req.files as unknown as Express.Multer.File[],
    path: `users/${req.user?._id}/posts/${post.assetFolderId}`,
  });
}
if (req?.body?.tags?.length){
     if (
      req?.body?.tags?.length &&
      (await this._userModel.find({ _id: { $in: req.body.tags } })).length !==
        req.body.tags.length
    ) {
      throw new CustomError("Invalid user id(s) in tags", 400);
    }
}
// ✅ حفظ التغييرات
await post.save();


return res.status(200).json({
  message: "Post updated successfully ❤️👌",
  post,
});

}





}

export default new postservice