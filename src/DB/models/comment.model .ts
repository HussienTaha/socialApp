import { Schema, model, Document, models, Types } from "mongoose";




export interface IComment
  {
  content: string;
  attachments?: string[];
  assetFolderId?: string;

  createdBy: Types.ObjectId;

  tags?: Schema.Types.ObjectId[];
  likes?: Schema.Types.ObjectId[];

  friends?: Schema.Types.ObjectId[];
postId?:Types.ObjectId 
  deleteAt?: Date;
  deletedBy?: Schema.Types.ObjectId;

  restoreAt?: Date;
  restoredBy?: Schema.Types.ObjectId;
}

 export const commentSchema = new Schema<IComment>(
  {
    content: { type: String, minlength: 5, maxlength: 10000, required: function (){return this.attachments?.length === 0 } },
    attachments: [String],
    assetFolderId: String,

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
 postId:{ type: Schema.Types.ObjectId, ref: "Post" , required: true },
    deleteAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoreAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  
  {
    timestamps: true,
    strictQuery: true
  }
);


commentSchema.pre(["find", "findOne", "findOneAndUpdate"], async function (next) {
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
 const commentModel = models.Post || model("Post", commentSchema);
export default commentModel