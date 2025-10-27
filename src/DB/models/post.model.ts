import { Schema, model, Document, models } from "mongoose";

export enum AllowCommentEnum {
  ALLOW = "ALLOW",
  DISALLOW = "DISALLOW",
}

export  enum AvailabilityEnum {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  HIDDEN = "HIDDEN",
  FRIENDS = "FRIENDS",
}


export interface IPost  {
  content: string;
  attachments?: string[];
  assetFolderId?: string;

  createdBy: Schema.Types.ObjectId;

  tags?: Schema.Types.ObjectId[];
  likes?: Schema.Types.ObjectId[];

  allowComment: AllowCommentEnum;
  availability: AvailabilityEnum;
  friends?: Schema.Types.ObjectId[];

  deleteAt?: Date;
  deletedBy?: Schema.Types.ObjectId;

  restoreAt?: Date;
  restoredBy?: Schema.Types.ObjectId;
}

 export const postSchema = new Schema<IPost>(
  {
    content: { type: String, minlength: 5, maxlength: 10000, required: function (){return this.attachments?.length === 0 } },
    attachments: [String],
    assetFolderId: String,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    allowComment: {
      type: String,
      enum: Object.values(AllowCommentEnum),
      default: AllowCommentEnum.ALLOW,
    },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.PUBLIC,
    },

    deleteAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoreAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
  }
);


postSchema.pre(["find", "findOne"], async function (next) {
  const query = this.getQuery();
  const {
   paranoid, ...rest
  }=query
  if (paranoid===false) {
this.setQuery({...rest})
  }
  else{
    this.setQuery({...rest,deleteAt:{$exists:false}})
  }
  next();
  
})
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
})
 const PostModel = models.Post || model("Post", postSchema);
export default PostModel